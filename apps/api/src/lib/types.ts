import type { IncomingMessage, ServerResponse } from "node:http";
import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
  z,
} from "@hono/zod-openapi";
import type { Context, Schema } from "hono";
import type pino from "pino";
import type { auth } from "./auth";

export type AppBindings = {
  Variables: {
    logger: pino.Logger;
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
  Bindings: {
    incoming: IncomingMessage;
    outgoing: ServerResponse;
  };
};

export type AppOpenAPI<S extends Schema = Record<string, never>> = OpenAPIHono<
  AppBindings,
  S
>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type AppSSEHandler<R extends RouteConfig> = (
  c: Context<AppBindings, R["path"]>
) => Response | Promise<Response>;

export type ZodSchema =
  | z.core.$ZodUnion
  | z.core.$ZodObject
  | z.ZodArray<z.core.$ZodObject>;
export type ZodIssue = z.core.$ZodIssue;

export interface DockerodeError extends Error {
  statusCode?: number;
  json?: unknown;
}
