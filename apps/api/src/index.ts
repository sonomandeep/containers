import app from "./app";

export default {
  // eslint-disable-next-line node/prefer-global/process
  port: process.env.PORT || 8080,
  fetch: app.fetch,
};
