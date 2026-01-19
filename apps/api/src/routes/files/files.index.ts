import { createRouter } from "@/lib/create-app";
import { authMiddleware } from "@/lib/middlewares/auth.middleware";
import * as handlers from "./files.handlers";
import * as routes from "./files.routes";

const router = createRouter();
router.use("/files/*", authMiddleware);

router
  .openapi(routes.upload, handlers.upload)
  .openapi(routes.remove, handlers.remove);

export default router;
