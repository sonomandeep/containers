import type { ListRoute, PullRoute, RemoveRoute } from "./images.routes";
import type { AppRouteHandler } from "@/lib/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
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
      message: result.error.message,
    }, result.error.code);
  }

  return c.json(result.data, HttpStatusCodes.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const input = c.req.valid("json");

  // TODO: implement removeImages function in images.service

  c.var.logger.info(input, "input");

  return c.json({ message: "images deleted" });
};
