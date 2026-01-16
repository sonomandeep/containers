import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import containers from "@/routes/containers/containers.index";
import images from "@/routes/images/images.index";

const app = createApp();

const routes = [containers, images] as const;

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}

export type AppType = (typeof routes)[number];

export default app;
