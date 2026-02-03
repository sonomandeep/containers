import type { WSContext } from "hono/ws";

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
