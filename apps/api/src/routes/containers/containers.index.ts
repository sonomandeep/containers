import { cors } from "hono/cors";
import { createRouter } from "@/lib/create-app";
import * as handlers from "./containers.handlers";
import * as routes from "./containers.routes";

const allowedOrigins = new Set([
  "http://core.internal:3000",
  "http://localhost:3000",
]);

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.launch, handlers.launch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.stop, handlers.stop)
  .openapi(routes.start, handlers.start)
  .get(
    routes.metrics.path,
    cors({
      origin: (origin) => {
        if (!origin) {
          return "*";
        }

        return allowedOrigins.has(origin) ? origin : null;
      },
      // per ora niente cookie -> false
      credentials: false,
    }),
    handlers.metrics
  );

export default router;
