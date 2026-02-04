import { createRouter } from "@/lib/create-app";
import * as handlers from "./agents.handlers";
import * as routes from "./agents.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .get("/agents/socket", handlers.socket);

export default router;
