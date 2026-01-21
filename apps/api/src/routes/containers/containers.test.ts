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
import * as service from "@/lib/services/containers.service";
import { mockAuthSession } from "@/test/auth";
import router from "./containers.index";

const createClient = () => testClient(createApp().route("/", router));

describe("list containers", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
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
    expect(response.status).toBe(401);
    expect(result).toEqual({ error: "Unauthorized" });
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
