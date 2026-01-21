import { OpenAPIHono } from "@hono/zod-openapi";
import type { Schema } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import env from "@/env";
import { auth } from "@/lib/auth";
import pinoLogger from "@/lib/middlewares/logger";
import { authMiddleware } from "./middlewares/auth.middleware";
import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}

export default function createApp() {
  const app = createRouter();

  app.use(requestId());
  app.use(pinoLogger);
  app.use(
    cors({
      origin: env.APP_URL,
      credentials: true,
    })
  );

  app.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  });

  app.use("/containers/*", authMiddleware);

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
