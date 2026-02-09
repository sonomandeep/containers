import {
  containerSchema,
  envinmentVariableSchema,
  launchContainerSchema,
} from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import {
  internalServerErrorSchema,
  notFoundSchema,
  unauthorizedSchema,
} from "@/lib/constants";

const tags = ["containers"];

export const list = createRoute({
  path: "/containers",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(containerSchema),
      "The list of container"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type ListRoute = typeof list;

export const stream = createRoute({
  path: "/containers/stream",
  method: "get",
  tags,
  responses: {},
});
export type StreamRoute = typeof stream;

export const updateEnvs = createRoute({
  path: "/containers/{containerId}/envs",
  method: "post",
  tags,
  request: {
    params: z.object({
      containerId: z.string().min(1),
    }),
    body: jsonContentRequired(
      z.array(envinmentVariableSchema),
      "Container envs"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(envinmentVariableSchema),
      "Container environment variables"
    ),
  },
});
export type UpdateEnvsRoute = typeof updateEnvs;

export const launch = createRoute({
  path: "/containers",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      launchContainerSchema,
      "Container launch options"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        id: z.string(),
      }),
      "Container launched"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Image not found"),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "A container with the same name already exists."
      ),
      "Container conflict"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type LaunchRoute = typeof launch;

export const remove = createRoute({
  path: "/containers/{containerId}",
  method: "delete",
  tags,
  request: {
    params: z.object({
      containerId: z.string().min(1),
    }),
    query: z.object({
      force: z.coerce.boolean().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("container deleted"),
      "Container deleted"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "Cannot delete a running container. Stop it and retry or force the removal."
      ),
      "Container running"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type RemoveRoute = typeof remove;

export const stop = createRoute({
  path: "/containers/{containerId}/stop",
  method: "post",
  tags,
  request: {
    params: z.object({
      containerId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.ACCEPTED]: jsonContent(
      z.object({
        commandId: z.string(),
        status: z.literal("queued"),
      }),
      "Stop command queued"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.SERVICE_UNAVAILABLE]: jsonContent(
      createMessageObjectSchema("agent not available"),
      "Agent unavailable"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type StopRoute = typeof stop;

export const start = createRoute({
  path: "/containers/{containerId}/start",
  method: "post",
  tags,
  request: {
    params: z.object({
      containerId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(containerSchema, "Container started"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema("Container is already running."),
      "Container running"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type StartRoute = typeof start;

export const restart = createRoute({
  path: "/containers/{containerId}/restart",
  method: "post",
  tags,
  request: {
    params: z.object({
      containerId: z.string().min(1),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(containerSchema, "Container restarted"),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema("Container is already running."),
      "Container running"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type RestartRoute = typeof restart;
