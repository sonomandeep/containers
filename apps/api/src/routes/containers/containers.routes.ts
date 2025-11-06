import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

const tags = ["containers"];

export const list = createRoute({
  path: "/containers",
  method: "get",
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(
        z.object({
          id: z.string(),
        }),
      ),
      "The list of container",
    ),
  },
});

export type ListRoute = typeof list;
