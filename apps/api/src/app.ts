import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import containers from "@/routes/containers/containers.index";
import images from "@/routes/images/images.index";
import index from "@/routes/index.route";
import nodes from "@/routes/nodes/nodes.index";

const app = createApp();

const routes = [index, containers, images, nodes] as const;

configureOpenAPI(app);

for (const route of routes) {
  app.route("/", route);
}

export type AppType = (typeof routes)[number];

export default app;
