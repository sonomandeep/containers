import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./agents.routes";
import { agentsRegistry } from "./agents.service";

export const list: AppRouteHandler<ListRoute> = (c) => {
  const agents = agentsRegistry
    .getAgents()
    .map((agent) => ({ id: agent.id, client: undefined }));

  return c.json(agents);
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
    onMessage(e) {
      const payload = JSON.parse(e.data as string);
      logger.info(payload, "message");
    },
  };
});
