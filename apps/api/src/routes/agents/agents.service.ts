import type { Container, ServiceResponse } from "@containers/shared";
import type { RedisClient } from "bun";
import type { WSContext } from "hono/ws";

const CONTAINERS_KEY = "containers";

type ConnectedAgent<T = unknown> = {
  id: string;
  client: WSContext<T>;
};

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
