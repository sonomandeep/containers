import crypto from "node:crypto";
import type {
  Agent,
  Container,
  CreateAgentInput,
  ServiceResponse,
} from "@containers/shared";
import type { RedisClient } from "bun";
import { and, desc, eq } from "drizzle-orm";
import type { WSContext } from "hono/ws";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { db } from "@/db";
import { agent as agentTable } from "@/db/schema";

const CONTAINERS_KEY = "containers";
const DUPLICATE_AGENT_NAME_MESSAGE =
  "An agent with the same name already exists in this workspace.";

type ConnectedAgent<T = unknown> = {
  id: string;
  client: WSContext<T>;
};

type CreateAgentError = {
  message: string;
  code:
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type ListAgentsError = {
  message: string;
  code: typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type GetAgentByIdError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function toAgent(record: typeof agentTable.$inferSelect): Agent {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export class AgentsRegistry<T = unknown> {
  private readonly clients = new Map<string, WSContext<T>>();

  add(id: string, ws: WSContext<T>) {
    this.clients.set(id, ws);
  }

  remove(id: string) {
    this.clients.delete(id);
  }

  get(id: string) {
    const agent = this.clients.get(id);
    if (!agent || agent.readyState !== WebSocket.OPEN) {
      return { data: null, error: "agent not found" };
    }

    return { data: this.clients.get(id), error: null };
  }

  getAgents(): Array<ConnectedAgent<T>> {
    const agents: Array<ConnectedAgent<T>> = [];

    for (const [id, client] of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        agents.push({ id, client });
      } else {
        this.clients.delete(id);
      }
    }

    return agents;
  }

  sendTo(
    id: string,
    data: string | ArrayBuffer | Uint8Array<ArrayBuffer>
  ): ServiceResponse<null, string> {
    const client = this.clients.get(id);
    if (!client) {
      return {
        data: null,
        error: "agent not available",
      };
    }

    if (client.readyState !== WebSocket.OPEN) {
      this.clients.delete(id);
      return {
        data: null,
        error: "agent not available",
      };
    }

    try {
      client.send(data);
      return {
        data: null,
        error: null,
      };
    } catch {
      this.clients.delete(id);
      return {
        data: null,
        error: "agent not available",
      };
    }
  }

  broadcast(data: string | ArrayBuffer | Uint8Array<ArrayBuffer>) {
    for (const [id, ws] of this.clients) {
      if (ws.readyState !== WebSocket.OPEN) {
        this.clients.delete(id);
        continue;
      }
      try {
        ws.send(data);
      } catch {
        this.clients.delete(id);
      }
    }
  }

  size() {
    return this.clients.size;
  }
}

export const agentsRegistry = new AgentsRegistry();

export async function listAgents(
  organizationId: string
): Promise<ServiceResponse<Array<Agent>, ListAgentsError>> {
  try {
    const records = await db
      .select()
      .from(agentTable)
      .where(eq(agentTable.organizationId, organizationId))
      .orderBy(desc(agentTable.createdAt));

    return {
      data: records.map((record) => toAgent(record)),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

export async function getAgentById(
  organizationId: string,
  agentId: string
): Promise<ServiceResponse<Agent, GetAgentByIdError>> {
  try {
    const records = await db
      .select()
      .from(agentTable)
      .where(
        and(
          eq(agentTable.organizationId, organizationId),
          eq(agentTable.id, agentId)
        )
      )
      .limit(1);

    const record = records.at(0);
    if (!record) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.NOT_FOUND,
          code: HttpStatusCodes.NOT_FOUND,
        },
      };
    }

    return {
      data: toAgent(record),
      error: null,
    };
  } catch {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

export async function createAgent(
  organizationId: string,
  input: CreateAgentInput
): Promise<ServiceResponse<Agent, CreateAgentError>> {
  try {
    const records = await db
      .insert(agentTable)
      .values({
        id: crypto.randomUUID(),
        organizationId,
        name: input.name,
      })
      .returning();

    const record = records.at(0);
    if (!record) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
          code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        },
      };
    }

    return {
      data: toAgent(record),
      error: null,
    };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        data: null,
        error: {
          message: DUPLICATE_AGENT_NAME_MESSAGE,
          code: HttpStatusCodes.CONFLICT,
        },
      };
    }

    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

function isContainerRemovalEvent(eventType: string) {
  return (
    eventType === "container.remove" ||
    eventType === "container.destroy" ||
    eventType === "container.delete"
  );
}

export async function storeContainer(
  redis: RedisClient,
  eventType: string,
  container: Container
) {
  if (isContainerRemovalEvent(eventType)) {
    await redis.hdel(CONTAINERS_KEY, container.id);
    return;
  }

  await redis.hset(CONTAINERS_KEY, {
    [container.id]: JSON.stringify(container),
  });
}

export async function storeContainersSnapshot(
  redis: RedisClient,
  containers: Array<Container>
) {
  await redis.del(CONTAINERS_KEY);

  if (containers.length === 0) {
    return;
  }

  const entries: Record<string, string> = {};
  for (const container of containers) {
    entries[container.id] = JSON.stringify(container);
  }

  await redis.hset(CONTAINERS_KEY, entries);
}
