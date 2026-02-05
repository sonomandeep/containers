/** biome-ignore-all lint/suspicious/noConsole: termination log */
import { serveStatic } from "hono/bun";
import env from "@/env";
import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import agents from "@/routes/agents/agents.index";
import containers from "@/routes/containers/containers.index";
import files from "@/routes/files/files.index";
import images from "@/routes/images/images.index";
import { auth } from "./lib/auth";
import { closeRedis } from "./lib/middlewares/redis.middleware";

const app = createApp();

const routes = [containers, files, images, agents] as const;

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

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing Redis...");
  closeRedis();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing Redis...");
  closeRedis();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  closeRedis();
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  closeRedis();
  process.exit(1);
});

export type AppType = (typeof routes)[number];

export default app;
