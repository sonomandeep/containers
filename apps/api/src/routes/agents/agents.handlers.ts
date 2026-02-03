import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import type { AppBindings } from "@/lib/types";

export const socket = upgradeWebSocket((c: Context<AppBindings>) => {
  const logger = c.var.logger;

  return {
    onOpen(e) {
      logger.debug(e, "connection opened");
    },
    onMessage(e) {
      const payload = JSON.parse(e.data as string);
      logger.info(payload, "message");
    },
    onError(e) {
      logger.debug(e, "connection error");
    },
  };
});
