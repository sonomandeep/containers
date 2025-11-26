import type { ListRoute, RemoveRoute } from "./containers.routes";
import type { AppRouteHandler } from "@/lib/types";
import * as HttpStatusCodes from "stoker/http-status-codes";
import { listContainers } from "@/lib/agent";
import { removeContainer } from "@/lib/services/containers";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const containers = await listContainers();

  return c.json(containers);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const params = c.req.valid("param");
  const query = c.req.valid("query");

  const result = await removeContainer({
    containerId: params.containerId,
    force: query.force,
  });
  if (result.error) {
    c.var.logger.error(result.error);
    return c.json(
      {
        message: result.error.message,
      },
      result.error.code,
    );
  }

  return c.json(
    {
      message: "container deleted",
    },
    HttpStatusCodes.OK,
  );
};
