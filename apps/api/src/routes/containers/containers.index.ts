import { createRouter } from "@/lib/create-app";
import { authMiddleware } from "@/lib/middlewares/auth.middleware";
import * as handlers from "./containers.handlers";
import * as routes from "./containers.routes";

const router = createRouter();
router.use("/containers/*", authMiddleware);

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.launch, handlers.launch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.stop, handlers.stop)
  .openapi(routes.start, handlers.start)
  .openapi(routes.restart, handlers.restart)
  .openapi(routes.updateEnvs, handlers.updateEnvs)
  .get(routes.stream.path, handlers.stream);

export default router;
