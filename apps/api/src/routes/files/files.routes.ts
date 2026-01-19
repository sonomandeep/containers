import { fileSchema } from "@containers/shared";
import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { jsonContent } from "stoker/openapi/helpers";
import { createMessageObjectSchema } from "stoker/openapi/schemas";
import { internalServerErrorSchema } from "@/lib/constants";

const tags = ["files"];

const uploadFileSchema = z.object({
  file: z.any().openapi({
    type: "string",
    format: "binary",
  }),
});

export const upload = createRoute({
  path: "/files",
  method: "post",
  tags,
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: uploadFileSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(fileSchema, "The uploaded file"),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createMessageObjectSchema("File is required."),
      "Missing or invalid file"
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      internalServerErrorSchema,
      "Internal server error"
    ),
  },
});

export type UploadRoute = typeof upload;
