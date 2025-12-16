import { websocket } from "hono/bun";
import app from "./app";
import env from "./env";

export default {
  port: env.PORT || 8080,
  fetch: app.fetch,
  websocket,
};
