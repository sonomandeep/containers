import { testClient } from "hono/testing";
import { describe, expect, expectTypeOf, it, vi } from "vitest";
import createApp from "@/lib/create-app.js";
import router from "./containers.index";
import * as auth from "@/lib/middlewares/auth.middleware";
import * as service from "@/lib/services/containers.service";

describe("list containers", () => {
  const app = testClient(createApp().route("/", router));

  it("should return empty containers list", async () => {
    const authMiddlewareSpy = vi.spyOn(auth, "authMiddleware");
    authMiddlewareSpy.mockImplementation(async (_, next) => {
      await next();
    });
    const listContainersServiceSpy = vi.spyOn(service, "");

    const response = await app.containers.$get();
    const result = await response.json();

    expect(response.status).toBe(401);
    expectTypeOf(result).toBeArray();

    authMiddlewareSpy.mockReset();
  });

  it("should return unauthorized error", async () => {
    const response = await app.containers.$get();
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result).toEqual({ error: "Unauthorized" });
  });
});
