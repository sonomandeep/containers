import { imageSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";

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
