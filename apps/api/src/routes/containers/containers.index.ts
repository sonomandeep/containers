import { createRouter } from "@/lib/create-app";

import * as handlers from "./containers.handlers";
import * as routes from "./containers.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.remove, handlers.remove);

export default router;
