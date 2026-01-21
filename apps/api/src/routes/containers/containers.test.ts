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
import type { Container } from "@containers/shared";
import createApp from "@/lib/create-app";
import * as service from "@/lib/services/containers.service";
import { mockAuthSession } from "@/test/auth";
import router from "./containers.index";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

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
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
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

  test("should return containers list from service", async () => {
    const listContainersServiceSpy = spyOn(service, "listContainers");
    const containers: Array<Container> = [
      {
        id: "container-1",
        name: "redis",
        image: "redis:alpine",
        state: "running",
        status: "Up 2 minutes",
        ports: [
          {
            ipVersion: "IPv4",
            private: 6379,
            public: 6379,
            type: "tcp",
          },
        ],
        metrics: {
          cpu: 1.2,
          memory: {
            used: 1024,
            total: 2048,
          },
        },
        envs: [{ key: "REDIS_PASSWORD", value: "secret" }],
        host: "test-host",
        created: 1_690_000_000,
      },
      {
        id: "container-2",
        name: "api",
        image: "ghcr.io/containers/api:latest",
        state: "exited",
        status: "Exited (1) 2 hours ago",
        ports: [],
        envs: [],
        created: 1_690_000_100,
      },
      {
        id: "container-3",
        name: "worker",
        image: "ghcr.io/containers/worker:latest",
        state: "paused",
        status: "Paused",
        ports: [
          {
            ipVersion: "IPv4",
            private: 3000,
            type: "tcp",
          },
        ],
        envs: [{ key: "LOG_LEVEL", value: "debug" }],
        created: 1_690_000_200,
      },
    ];

    listContainersServiceSpy.mockResolvedValue(containers);

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(result).toEqual(containers);
  });
});
