import type { Agent, ServiceResponse } from "@containers/shared";
import { containerSchema, imageSchema } from "@containers/shared";
import type { RedisClient } from "bun";
import type { WSContext } from "hono/ws";
import z from "zod";

const CONTAINERS_KEY = "containers";

const baseEventSchema = z.object({
  type: z.string().min(1),
  ts: z.string().min(1),
  data: z.unknown(),
});

const containerEventSchema = baseEventSchema.extend({
  type: z.string().refine((value) => value.startsWith("container."), {
    message: "expected container event type",
  }),
  data: containerSchema,
});

const imageEventSchema = baseEventSchema.extend({
  type: z.string().refine((value) => value.startsWith("image."), {
    message: "expected image event type",
  }),
  data: imageSchema,
});

const snapshotPayloadSchema = z.object({
  containers: z.array(containerSchema),
  images: z.array(imageSchema),
});

const snapshotEventSchema = baseEventSchema.extend({
  type: z.literal("snapshot"),
  data: snapshotPayloadSchema,
});

const agentEventSchema = z.union([
  containerEventSchema,
  imageEventSchema,
  snapshotEventSchema,
]);
export type AgentEvent = z.infer<typeof agentEventSchema>;
export type ContainerEvent = z.infer<typeof containerEventSchema>;
export type SnapshotEvent = z.infer<typeof snapshotEventSchema>;

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

  getAgents(): Array<Agent<WSContext<T>>> {
    const agents: Array<Agent<WSContext<T>>> = [];

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

export function parseAgentMessage(data: unknown): AgentEvent {
  if (typeof data !== "string") {
    throw new Error("unsupported message type");
  }

  const payload = JSON.parse(data) as unknown;
  return agentEventSchema.parse(payload);
}

export function isContainerEvent(event: AgentEvent): event is ContainerEvent {
  return event.type.startsWith("container.");
}

export function isSnapshotEvent(event: AgentEvent): event is SnapshotEvent {
  return event.type === "snapshot";
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
  container: z.infer<typeof containerSchema>
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
  containers: Array<z.infer<typeof containerSchema>>
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
