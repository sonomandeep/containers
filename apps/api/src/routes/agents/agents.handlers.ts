import type { RedisClient } from "bun";
import type { WSContext } from "hono/ws";
import type { Logger } from "pino";
import type { AppBindings } from "@/lib/types";

export function createHandlers(logger: Logger, redis: RedisClient) {
  return {
    onOpen: (event: Event, ws: WSContext<AppBindings>) => {
      logger.info(ws.raw);
      logger.info({ event, ws }, "connection opened");
    },

    onMessage: (evt: MessageEvent, _ws: WSContext<AppBindings>) => {
      logger.info(`message: ${evt.data}`);
      redis.set("last-message", evt.data.toString());
    },

    onClose: (event: CloseEvent, ws: WSContext<AppBindings>) => {
      logger.info({ event, ws }, "connection closed");
    },
  };
}
