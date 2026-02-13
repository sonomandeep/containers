import { agentSchema, createAgentSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent, jsonContentRequired } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { internalServerErrorSchema, unauthorizedSchema } from "@/lib/constants";

const tags = ["agents"];

export const create = createRoute({
  path: "/agents",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(createAgentSchema, "Agent payload"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(agentSchema, "Created agent"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Active workspace is required."),
      "Missing active workspace"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      unauthorizedSchema,
      "Unauthorized"
    ),
    [HttpStatusCodes.CONFLICT]: jsonContent(
      createMessageObjectSchema(
        "An agent with the same name already exists in this workspace."
      ),
      "Duplicate agent name"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});
export type CreateRoute = typeof create;

export const list = createRoute({
  path: "/agents",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(z.array(agentSchema), "List of agents"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("Active workspace is required."),
      "Missing active workspace"
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
