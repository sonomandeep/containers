import { createRouter } from "@/lib/create-app";

import * as handlers from "./images.handlers";
import * as routes from "./images.routes";

const router = createRouter().openapi(routes.list, handlers.list);

export default router;
