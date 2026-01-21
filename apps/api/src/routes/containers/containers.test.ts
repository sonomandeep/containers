import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import { testClient } from "hono/testing";
import createApp from "@/lib/create-app.js";
import * as auth from "@/lib/middlewares/auth.middleware";
import * as service from "@/lib/services/containers.service";
import router from "./containers.index";

describe("list containers", () => {
  test("should return unauthorized error", async () => {
    const response = await testClient(
      createApp().route("/", router)
    ).containers.$get();
    const result = await response.json();

    expect(response.status as number).toBe(401);
    expect(result as unknown).toEqual({ error: "Unauthorized" });
  });

  describe("list containers without auth", () => {
    beforeEach(() => {
      const authMiddlewareSpy = spyOn(auth, "authMiddleware");
      authMiddlewareSpy.mockImplementation(
        async (_: unknown, next: () => Promise<void>) => {
          await next();
        }
      );
    });

    test("should return empty containers list", async () => {
      const listContainersServiceSpy = spyOn(service, "listContainers");
      listContainersServiceSpy.mockImplementation(() => Promise.resolve([]));

      const response = await testClient(
        createApp().route("/", router)
      ).containers.$get();
      const result = await response.json();

      expect(response.status).toBe(200);
      // expectTypeOf(result).toBeArray();
      expect(result).toEqual([]);

      listContainersServiceSpy;
    });
  });
});
