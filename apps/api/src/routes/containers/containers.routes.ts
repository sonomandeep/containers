import { containerSchema, launchContainerSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { internalServerErrorSchema, notFoundSchema } from "@/lib/constants";

const tags = ["containers"];

export const list = createRoute({
  path: "/containers",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(containerSchema),
      "The list of container",
    ),
  },
});

export type ListRoute = typeof list;

export const launch = createRoute({
  path: "/containers",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      launchContainerSchema,
      "Container launch options",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.object({
        message: z.string(),
        id: z.string(),
      }),
      "Container launched",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Image not found"),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "A container with the same name already exists.",
      ),
      "Container conflict",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error",
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
      "Container deleted",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "Cannot delete a running container. Stop it and retry or force the removal.",
      ),
      "Container running",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error",
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
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("container stopped"),
      "Container stopped",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema("Container is not running."),
      "Container not running",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error",
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
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("container started"),
      "Container started",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Container not found",
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema("Container is already running."),
      "Container running",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error",
    ),
  },
});

export type StartRoute = typeof start;
