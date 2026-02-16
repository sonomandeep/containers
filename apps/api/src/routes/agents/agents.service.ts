import crypto from "node:crypto";
import type {
  Agent,
  Container,
  CreateAgentInput,
  ServiceResponse,
  UpdateAgentInput,
} from "@containers/shared";
import type { RedisClient } from "bun";
import { and, desc, eq } from "drizzle-orm";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { db } from "@/db";
import { agent as agentTable } from "@/db/schema";

export { AgentsRegistry, agentsRegistry } from "./agents.registry";

const CONTAINERS_KEY = "containers";
const DUPLICATE_AGENT_NAME_MESSAGE =
  "An agent with the same name already exists in this workspace.";

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

type UpdateAgentError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type RemoveAgentError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

function getDbErrorCode(error: unknown): string | null {
  const MAX_ERROR_DEPTH = 5;
  let currentError: unknown = error;

  for (let depth = 0; depth < MAX_ERROR_DEPTH; depth += 1) {
    if (typeof currentError !== "object" || currentError === null) {
      return null;
    }

    const errorCode = (currentError as { code?: unknown }).code;
    if (typeof errorCode === "string") {
      return errorCode;
    }

    currentError = (currentError as { cause?: unknown }).cause;
  }

  return null;
}

function isUniqueViolation(error: unknown) {
  return getDbErrorCode(error) === "23505";
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

export async function updateAgent(
  organizationId: string,
  agentId: string,
  input: UpdateAgentInput
): Promise<ServiceResponse<Agent, UpdateAgentError>> {
  try {
    const records = await db
      .update(agentTable)
      .set({
        name: input.name,
      })
      .where(
        and(
          eq(agentTable.organizationId, organizationId),
          eq(agentTable.id, agentId)
        )
      )
      .returning();

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

export async function removeAgent(
  organizationId: string,
  agentId: string
): Promise<ServiceResponse<null, RemoveAgentError>> {
  try {
    const deletedRecords = await db
      .delete(agentTable)
      .where(
        and(
          eq(agentTable.organizationId, organizationId),
          eq(agentTable.id, agentId)
        )
      )
      .returning({
        id: agentTable.id,
      });

    const deletedRecord = deletedRecords.at(0);
    if (!deletedRecord) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.NOT_FOUND,
          code: HttpStatusCodes.NOT_FOUND,
        },
      };
    }

    return {
      data: null,
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
