import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
  isContainerEvent,
  isSnapshotEvent,
  parseAgentMessage,
} from "@/lib/services/agent-protocol.service";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./agents.routes";
import {
  agentsRegistry,
  storeContainer,
  storeContainersSnapshot,
} from "./agents.service";

export const list: AppRouteHandler<ListRoute> = (c) => {
  const agents = agentsRegistry
    .getAgents()
    .map((agent) => ({ id: agent.id, client: null }));

  return c.json(agents, HttpStatusCodes.OK);
};

export const socket = upgradeWebSocket((c: Context<AppBindings>) => {
  const logger = c.var.logger;
  const id = c.req.query("id");
  if (!id) {
    throw new Error("handle validation");
  }

  return {
    onOpen(_evt, ws) {
      agentsRegistry.add(id, ws);
      ws.send(JSON.stringify({ type: "welcome", id }));
    },
    onClose(e) {
      agentsRegistry.remove(id);
      logger.debug(e, "connection closed");
    },
    onError(e) {
      agentsRegistry.remove(id);
      logger.debug(e, "connection error");
    },
    async onMessage(e) {
      try {
        const payload = parseAgentMessage(e.data);

        if (isSnapshotEvent(payload)) {
          await storeContainersSnapshot(c.var.redis, payload.data.containers);
        }

        if (isContainerEvent(payload)) {
          await storeContainer(c.var.redis, payload.type, payload.data);
        }
      } catch (error) {
        logger.warn({ error }, "invalid agent message");
      }
    },
  };
});
