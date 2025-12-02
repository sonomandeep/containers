import { imageSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { internalServerErrorSchema, notFoundSchema } from "@/lib/constants";

const tags = ["images"];

export const list = createRoute({
  path: "/images",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(imageSchema),
      "The list of images"
    ),
  },
});

export const pull = createRoute({
  path: "/images",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        registry: z.string(),
        name: z.string(),
        tag: z.string(),
      }),
      "The image to be pulled"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(imageSchema, "The pulled image"),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(notFoundSchema, "Image not found"),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});

export const remove = createRoute({
  path: "/images/remove",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        images: z.array(z.string()),
        force: z.boolean().optional().default(false),
      }),
      "Array of images to delete"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("images deleted"),
      "Images deleted"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "Cannot delete images with existing containers. Stop them or retry with force delete."
      ),
      "Images still referenced by containers"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});

export type ListRoute = typeof list;
export type PullRoute = typeof pull;
export type RemoveRoute = typeof remove;
