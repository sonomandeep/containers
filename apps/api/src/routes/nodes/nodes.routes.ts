import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

const tags = ["nodes"];

export const monitor = createRoute({
  path: "/nodes/monitor",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createMessageObjectSchema("nodes monitoring"),
      "Nodes monitoring"
    ),
  },
});

export type Monitor = typeof monitor;
