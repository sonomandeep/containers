import type { ServiceResponse } from "@containers/shared";
import type { WSContext } from "hono/ws";

const UNASSIGNED_ORGANIZATION_ID = "__unassigned__";

export type ConnectedAgent<T = unknown> = {
  id: string;
  organizationId: string;
  client: WSContext<T>;
};

export class AgentsRegistry<T = unknown> {
  private readonly clientsByOrganization = new Map<
    string,
    Map<string, WSContext<T>>
  >();

  private readonly organizationByAgent = new Map<string, string>();

  add(agentId: string, ws: WSContext<T>): void;
  add(organizationId: string, agentId: string, ws: WSContext<T>): void;
  add(first: string, second: string | WSContext<T>, third?: WSContext<T>) {
    if (third !== undefined && typeof second === "string") {
      this.setAgent(first, second, third);
      return;
    }

    if (typeof second === "string") {
      throw new Error("agent websocket client is required");
    }

    this.setAgent(UNASSIGNED_ORGANIZATION_ID, first, second);
  }

  remove(agentId: string) {
    const organizationId = this.organizationByAgent.get(agentId);
    if (!organizationId) {
      return;
    }

    const organizationClients = this.clientsByOrganization.get(organizationId);
    organizationClients?.delete(agentId);

    if (organizationClients && organizationClients.size === 0) {
      this.clientsByOrganization.delete(organizationId);
    }

    this.organizationByAgent.delete(agentId);
  }

  get(id: string) {
    const entry = this.getClientEntry(id);
    if (!entry) {
      return { data: null, error: "agent not found" };
    }

    return { data: entry.client, error: null };
  }

  getAgents(): Array<{ id: string; client: WSContext<T> }> {
    const agents: Array<{ id: string; client: WSContext<T> }> = [];
    const staleIds: Array<string> = [];

    for (const organizationClients of this.clientsByOrganization.values()) {
      for (const [id, client] of organizationClients) {
        if (client.readyState === WebSocket.OPEN) {
          agents.push({ id, client });
          continue;
        }

        staleIds.push(id);
      }
    }

    for (const staleId of staleIds) {
      this.remove(staleId);
    }

    return agents;
  }

  getAgentsByOrganization(organizationId: string): Array<ConnectedAgent<T>> {
    const organizationClients = this.clientsByOrganization.get(organizationId);
    if (!organizationClients) {
      return [];
    }

    const agents: Array<ConnectedAgent<T>> = [];
    const staleIds: Array<string> = [];

    for (const [id, client] of organizationClients) {
      if (client.readyState === WebSocket.OPEN) {
        agents.push({
          id,
          organizationId,
          client,
        });
        continue;
      }

      staleIds.push(id);
    }

    for (const staleId of staleIds) {
      this.remove(staleId);
    }

    return agents;
  }

  sendTo(
    id: string,
    data: string | ArrayBuffer | Uint8Array<ArrayBuffer>
  ): ServiceResponse<null, string> {
    const entry = this.getClientEntry(id);
    if (!entry) {
      return {
        data: null,
        error: "agent not available",
      };
    }

    try {
      entry.client.send(data);

      return {
        data: null,
        error: null,
      };
    } catch {
      this.remove(id);

      return {
        data: null,
        error: "agent not available",
      };
    }
  }

  broadcast(data: string | ArrayBuffer | Uint8Array<ArrayBuffer>) {
    const agents = this.getAgents();

    for (const agent of agents) {
      try {
        agent.client.send(data);
      } catch {
        this.remove(agent.id);
      }
    }
  }

  size() {
    return this.organizationByAgent.size;
  }

  private setAgent(organizationId: string, agentId: string, ws: WSContext<T>) {
    this.remove(agentId);

    let organizationClients = this.clientsByOrganization.get(organizationId);
    if (!organizationClients) {
      organizationClients = new Map<string, WSContext<T>>();
      this.clientsByOrganization.set(organizationId, organizationClients);
    }

    organizationClients.set(agentId, ws);
    this.organizationByAgent.set(agentId, organizationId);
  }

  private getClientEntry(agentId: string) {
    const organizationId = this.organizationByAgent.get(agentId);
    if (!organizationId) {
      return null;
    }

    const organizationClients = this.clientsByOrganization.get(organizationId);
    if (!organizationClients) {
      this.organizationByAgent.delete(agentId);
      return null;
    }

    const client = organizationClients.get(agentId);
    if (!client) {
      this.organizationByAgent.delete(agentId);

      if (organizationClients.size === 0) {
        this.clientsByOrganization.delete(organizationId);
      }

      return null;
    }

    if (client.readyState !== WebSocket.OPEN) {
      this.remove(agentId);
      return null;
    }

    return { organizationId, client };
  }
}

export const agentsRegistry = new AgentsRegistry();
