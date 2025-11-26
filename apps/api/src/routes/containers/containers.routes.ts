import { containerSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
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
