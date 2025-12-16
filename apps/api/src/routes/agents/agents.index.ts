import type { Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { createRouter } from "@/lib/create-app";
import type { AppBindings } from "@/lib/types";
import { createHandlers } from "./agents.handlers";

const router = createRouter().get(
  "/agents",
  upgradeWebSocket((c: Context<AppBindings>) => {
    const logger = c.var.logger;
    const redis = c.var.redis;

    return createHandlers(logger, redis);
  })
);

export default router;
