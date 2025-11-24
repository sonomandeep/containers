import type { ListRoute, PullRoute } from "./images.routes";
import type { AppRouteHandler } from "@/lib/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { listImages } from "@/lib/agent";
import { pullImage } from "@/lib/services/images";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const images = await listImages();

  return c.json(images);
};

export const pull: AppRouteHandler<PullRoute> = async (c) => {
  const input = c.req.valid("json");

  const result = await pullImage(input);
  if (result.error || result.data === null) {
    c.var.logger.error(result.error);
    return c.json({
      message: HttpStatusPhrases.NOT_FOUND,
    }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(result.data, HttpStatusCodes.OK);
};
