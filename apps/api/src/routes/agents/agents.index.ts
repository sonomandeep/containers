import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { createRouter } from "@/lib/create-app";
import type { AppBindings } from "@/lib/types";

const router = createRouter().get(
  "/ws",
  upgradeWebSocket((c: Context<AppBindings>) => {
    const logger = c.var.logger;
    const redis = c.var.redis;

    return {
      onOpen: (event, ws) => {
        logger.info({ event, ws }, "connection opened");
      },

      onMessage(evt, _) {
        logger.info(`message: ${evt.data}`);
        redis.set("last-message", evt.data.toString());
      },

      onClose: (event, ws) => {
        logger.info({ event, ws }, "connection closed");
      },
    };
  })
);

export default router;
