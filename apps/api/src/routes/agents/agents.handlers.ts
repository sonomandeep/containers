import type { RedisClient } from "bun";
import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import type { AppBindings } from "@/lib/types";
import z from "zod";

const pingMessageSchema = z.object({
  type: z.literal("ping"),
  timestamp: z.number().optional(),
});

const textMessageSchema = z.object({
  type: z.literal("message"),
  payload: z.string().min(1),
  userId: z.string().optional(),
  timestamp: z.number().optional(),
});

const commandMessageSchema = z.object({
  type: z.literal("command"),
  command: z.string().min(1),
  userId: z.string().optional(),
});

export const agentMessageSchema = z.discriminatedUnion("type", [
  pingMessageSchema,
  textMessageSchema,
  commandMessageSchema,
]);

export function createHandlers(logger: Logger, redis: RedisClient) {
  return {
    onOpen: (event: Event, ws: WSContext<AppBindings>) => {
      logger.info({ event, ws }, "connection opened");
    },

    onMessage: (evt: MessageEvent, ws: WSContext<AppBindings>) => {
      const raw = JSON.parse(evt.data.toString());
      const message = agentMessageSchema.safeParse(raw);

      if (message.error) {
        logger.error(z.treeifyError(message.error), "validation error");
        return;
      }

      switch (message.data.type) {
        case "ping":
          logger.debug(message.data);
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;

        case "message":
          logger.debug(message.data);
          redis.set("last-message", JSON.stringify(message.data));
          break;

        case "command":
          logger.debug(message.data);
          break;
      }
    },

    onClose: (event: CloseEvent, ws: WSContext<AppBindings>) => {
      logger.info({ event, ws }, "connection closed");
    },
  };
}
