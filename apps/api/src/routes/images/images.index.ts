import { createRouter } from "@/lib/create-app";
import { authMiddleware } from "@/lib/middlewares/auth.middleware";
import * as handlers from "./images.handlers";
import * as routes from "./images.routes";

const router = createRouter();
router.use("/images/*", authMiddleware);

router
  .openapi(routes.list, handlers.list)
  .openapi(routes.pull, handlers.pull)
  .openapi(routes.remove, handlers.remove);

export default router;
