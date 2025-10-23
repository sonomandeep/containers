import type { Context, Next } from "hono";
import pino from "pino";
import env from "@/env";

const base = pino({
  level: env.LOG_LEVEL ?? "info",
  transport:
    env.NODE_ENV === "production"
      ? undefined
      : { target: "pino-pretty", options: { colorize: true } },
});

export async function pinoLogger(c: Context, next: Next) {
  const start = Date.now();
  const child = base.child({ requestId: c.get("requestId") });

  c.set("logger", child);

  child.info({ msg: "request start", method: c.req.method, path: c.req.path });

  await next();

  child.info({
    msg: "request end",
    status: c.res.status,
    duration: Date.now() - start,
  });
}

export default pinoLogger;
