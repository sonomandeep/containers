import type { Agent } from "@containers/shared";
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

const snapshotEventSchema = baseEventSchema.extend({
  type: z.string().refine((value) => value.startsWith("snapshot"), {
    message: "expected snapshot event type",
  }),
  data: z.unknown(),
});

const agentEventSchema = z.union([
  containerEventSchema,
  imageEventSchema,
  snapshotEventSchema,
]);
export type AgentEvent = z.infer<typeof agentEventSchema>;
export type ContainerEvent = z.infer<typeof containerEventSchema>;

export class AgentsRegistry<T = unknown> {
  private readonly clients = new Map<string, WSContext<T>>();

  add(id: string, ws: WSContext<T>) {
    this.clients.set(id, ws);
  }

  remove(id: string) {
    this.clients.delete(id);
  }

  get(id: string) {
    return this.clients.get(id);
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

  sendTo(id: string, data: string | ArrayBuffer | Uint8Array<ArrayBuffer>) {
    const client = this.clients.get(id);
    if (!client) {
      return false;
    }

    if (client.readyState !== WebSocket.OPEN) {
      this.clients.delete(id);
      return false;
    }

    try {
      client.send(data);
      return true;
    } catch {
      this.clients.delete(id);
      return false;
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
