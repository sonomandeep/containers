import { createRouter } from "@/lib/create-app";
import * as handlers from "./containers.handlers";
import * as routes from "./containers.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.launch, handlers.launch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.stop, handlers.stop)
  .openapi(routes.start, handlers.start)
  .openapi(routes.restart, handlers.restart)
  .openapi(routes.updateEnvs, handlers.updateEnvs)
  .get("/containers/:containerId/terminal", handlers.terminal)
  .get(routes.stream.path, handlers.stream);

export default router;
