import type { ListRoute } from "./containers.routes";
import type { AppRouteHandler } from "@/lib/types";
import { listContainers } from "@/lib/agent";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const containers = await listContainers();

  return c.json(containers);
};
