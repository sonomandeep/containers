import { containerSchema, imageSchema } from "@containers/shared";
import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import * as HttpStatusCodes from "stoker/http-status-codes";
import z from "zod";
import type { AppBindings, AppRouteHandler } from "@/lib/types";
import type { ListRoute } from "./agents.routes";
import { agentsRegistry } from "./agents.service";

export const list: AppRouteHandler<ListRoute> = (c) => {
  const agents = agentsRegistry
    .getAgents()
    .map((agent) => ({ id: agent.id, client: null }));

  return c.json(agents, HttpStatusCodes.OK);
};

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

const agentEventSchema = z.union([containerEventSchema, imageEventSchema]);

const parseAgentMessage = (data: unknown) => {
  if (typeof data !== "string") {
    throw new Error("unsupported message type");
  }

  const payload = JSON.parse(data) as unknown;
  return agentEventSchema.parse(payload);
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
      const payload = parseAgentMessage(e.data);
      logger.info(payload, "message");
    },
  };
});
