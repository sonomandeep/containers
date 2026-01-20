import { serveStatic } from "hono/bun";
import env from "@/env";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import containers from "@/routes/containers/containers.index";
import files from "@/routes/files/files.index";
import images from "@/routes/images/images.index";

const app = createApp();

const routes = [containers, files, images] as const;

configureOpenAPI(app);

app.use(
  "/uploads/*",
  serveStatic({
    root: env.UPLOAD_DIR,
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, ""),
  })
);

for (const route of routes) {
  app.route("/", route);
}

export type AppType = (typeof routes)[number];

export default app;
