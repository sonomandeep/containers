import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = c.get("session");

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
