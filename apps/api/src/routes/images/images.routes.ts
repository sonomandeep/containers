import { imageSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { internalServerErrorSchema, notFoundSchema } from "@/lib/constants";

const tags = ["images"];

export const list = createRoute({
  path: "/images",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(imageSchema),
      "The list of images",
    ),
  },
});

export type ListRoute = typeof list;

export const pull = createRoute({
  path: "/images",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(z.object({
      registry: z.string(),
      name: z.string(),
      tag: z.string(),
    }), "The image to be pulled"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      imageSchema,
      "The pulled image",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Image not found",
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error",
    ),
  },
});

export type PullRoute = typeof pull;
