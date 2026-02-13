import { createRouter } from "@/lib/create-app";
import * as handlers from "./agents.handlers";
import * as routes from "./agents.routes";

const router = createRouter();
const apiRouter = createRouter();

apiRouter.openapi(routes.create, handlers.create);
apiRouter.openapi(routes.list, handlers.list);
apiRouter.openapi(routes.getById, handlers.getById);
apiRouter.openapi(routes.update, handlers.update);

router.get("/agents/socket", handlers.socket);
router.route("/", apiRouter);

export default router;
