/** biome-ignore-all lint/suspicious/noConsole: termination log */

import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import containers from "@/routes/containers/containers.index";
import images from "@/routes/images/images.index";
import index from "@/routes/index.route";
import { closeRedis } from "./lib/middlewares/redis";

const app = createApp();

const routes = [index, containers, images] as const;

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}

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
