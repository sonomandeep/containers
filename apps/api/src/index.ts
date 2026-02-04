import { websocket } from "hono/bun";
import app from "./app";
import env from "./env";

export default {
  port: env.PORT || 8080,
  // fetch: (req: Request) => {
  //   const url = new URL(req.url);
  //   url.protocol = req.headers.get("x-forwarded-proto") ?? url.protocol;
  //   return app.fetch(new Request(url, req));
  // },
  fetch: app.fetch,
  hostname: "0.0.0.0",
  websocket,
};
