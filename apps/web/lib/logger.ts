// lib/logger.server.ts
import pino from "pino";
import pinoPretty from "pino-pretty";
import env from "@/lib/env";

const isDev = env.NODE_ENV !== "production";

export const logger = isDev
  ? pino(
      { level: env.LOG_LEVEL || "debug" },
      pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      })
    )
  : pino({ level: env.LOG_LEVEL });
