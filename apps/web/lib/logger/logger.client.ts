// lib/logger.client.ts
import pino from "pino";
import env from "@/lib/env";

export const logger = pino({
  browser: {
    asObject: true,
    transmit: {
      level: "info",
      send: () => { },
    },
  },
  level: env.NODE_ENV === "production" ? "warn" : "debug",
});
