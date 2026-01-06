import { createRouter } from "@/lib/create-app";
import * as handlers from "./nodes.handlers";
import * as routes from "./nodes.routes";

const router = createRouter().openapi(routes.monitor, handlers.monitor);

export default router;
