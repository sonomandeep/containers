import * as HttpStatusCodes from "stoker/http-status-codes";
import type { AppRouteHandler } from "@/lib/types";
import type { Monitor } from "./nodes.routes";

export const monitor: AppRouteHandler<Monitor> = (c) => {
  c.var.logger.info("hello world!");
  return c.json({ message: "nodes monitoring" }, HttpStatusCodes.OK);
};
