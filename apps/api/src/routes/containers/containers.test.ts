import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  spyOn,
  test,
} from "bun:test";
import { testClient } from "hono/testing";
import createApp from "@/lib/create-app.js";
import { auth as authClient } from "@/lib/auth";
import * as service from "@/lib/services/containers.service";
import router from "./containers.index";

const createClient = () => testClient(createApp().route("/", router));

const mockSession = {
  session: {
    id: "session-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "user-1",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    token: "token-1",
  },
  user: {
    id: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    email: "test@example.com",
    emailVerified: true,
    name: "Test User",
  },
};

describe("list containers", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    getSessionSpy = spyOn(authClient.api, "getSession").mockResolvedValue(
      mockSession,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockResolvedValue([]);

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).not.toHaveBeenCalled();
    expect(response.status as number).toBe(401);
    expect(result as unknown).toEqual({ error: "Unauthorized" });
  });

  test("should return empty containers list", async () => {
    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockResolvedValue([]);

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(result).toEqual([]);
  });
});
