import type { ListRoute } from "./images.routes";
import type { AppRouteHandler } from "@/lib/types";

import { listImages } from "@/lib/agent";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const images = await listImages();

  return c.json(images);
};
