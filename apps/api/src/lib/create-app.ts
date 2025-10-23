import type { Schema } from "hono";
import type { AppBindings, AppOpenAPI } from "./types";
import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";
import pinoLogger from "@/lib/middlewares/logger";

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

  app.notFound(notFound);
  app.onError(onError);

  return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  return createApp().route("/", router);
}
