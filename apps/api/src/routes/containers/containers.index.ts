import { createRouter } from "@/lib/create-app";

import * as handlers from "./containers.handlers";
import * as routes from "./containers.routes";

const router = createRouter().openapi(routes.list, handlers.list);

export default router;
