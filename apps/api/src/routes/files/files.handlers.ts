import * as HttpStatusCodes from "stoker/http-status-codes";
import { uploadFile } from "@/lib/services/files.service";
import type { AppRouteHandler } from "@/lib/types";
import type { UploadRoute } from "./files.routes";

export const upload: AppRouteHandler<UploadRoute> = async (c) => {
  const input = c.req.valid("form");

  const result = await uploadFile(input.file);
  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code
    );
  }

  return c.json(result.data, HttpStatusCodes.CREATED);
};
