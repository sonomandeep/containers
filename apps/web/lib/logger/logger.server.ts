// lib/logger.server.ts
import pino from "pino";
import pinoPretty from "pino-pretty";
import env from "@/lib/env";

const isDev = env.NODE_ENV !== "production";

export const logger = isDev
  ? pino(
      { level: "debug" },
      pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss",
        ignore: "pid,hostname",
      }),
    )
  : pino({ level: isDev ? "debug" : "info" });
