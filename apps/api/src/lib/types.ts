import type {
  OpenAPIHono,
  RouteConfig,
  RouteHandler,
  z,
} from "@hono/zod-openapi";
import type { Schema } from "hono";
import type { IncomingMessage, ServerResponse } from "node:http";
import type pino from "pino";

export interface AppBindings {
  Variables: {
    logger: pino.Logger;
  };
  Bindings: {
    incoming: IncomingMessage;
    outgoing: ServerResponse;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI<S extends Schema = {}> = OpenAPIHono<AppBindings, S>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;

export type ZodSchema =
  | z.core.$ZodUnion
  | z.core.$ZodObject
  | z.ZodArray<z.core.$ZodObject>;
export type ZodIssue = z.core.$ZodIssue;

export interface DockerodeError extends Error {
  statusCode?: number;
  json?: unknown;
}
