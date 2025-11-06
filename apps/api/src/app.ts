import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import containers from "@/routes/containers/containers.index";
import index from "@/routes/index.route";

const app = createApp();

const routes = [index, containers] as const;

configureOpenAPI(app);

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = (typeof routes)[number];

export default app;
