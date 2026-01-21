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
import type { Container, LaunchContainerInput } from "@containers/shared";
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

  test("should return 500 when service throws", async () => {
    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockRejectedValue(new Error("Service failed"));

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toMatchObject({ message: "Service failed" });
  });
});

describe("launch container", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;
  const launchPayload: LaunchContainerInput = {
    name: "api",
    image: "ghcr.io/containers/api:latest",
    restartPolicy: "always",
  };

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const launchContainerServiceSpy = spyOn(service, "launchContainer");
    launchContainerServiceSpy.mockResolvedValue({
      data: { id: "container-1" },
      error: null,
    });

    const response = await createClient().containers.$post({
      json: launchPayload,
    });
    const result = await response.json();

    expect(launchContainerServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should launch container", async () => {
    const launchContainerServiceSpy = spyOn(service, "launchContainer");
    launchContainerServiceSpy.mockResolvedValue({
      data: { id: "container-1" },
      error: null,
    });

    const response = await createClient().containers.$post({
      json: launchPayload,
    });
    const result: unknown = await response.json();

    expect(launchContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(launchContainerServiceSpy).toHaveBeenCalledWith(launchPayload);
    expect(response.status).toBe(200);
    expect(result).toEqual({ message: "container launched", id: "container-1" });
  });

  test("should return not found error", async () => {
    const launchContainerServiceSpy = spyOn(service, "launchContainer");
    launchContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: 404,
      },
    });

    const response = await createClient().containers.$post({
      json: launchPayload,
    });
    const result = await response.json();

    expect(launchContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });

  test("should return conflict error", async () => {
    const launchContainerServiceSpy = spyOn(service, "launchContainer");
    launchContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: "A container with the same name already exists.",
        code: 409,
      },
    });

    const response = await createClient().containers.$post({
      json: launchPayload,
    });
    const result = await response.json();

    expect(launchContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(result).toEqual({
      message: "A container with the same name already exists.",
    });
  });

  test("should return internal server error", async () => {
    const launchContainerServiceSpy = spyOn(service, "launchContainer");
    launchContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers.$post({
      json: launchPayload,
    });
    const result = await response.json();

    expect(launchContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});

describe("start container", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;
  const containerId = "container-1";
  const container: Container = {
    id: containerId,
    name: "api",
    image: "ghcr.io/containers/api:latest",
    state: "running",
    status: "running (running)",
    ports: [
      {
        ipVersion: "IPv4",
        private: 3000,
        public: 3000,
        type: "tcp",
      },
    ],
    metrics: {
      cpu: 0.8,
      memory: {
        used: 2048,
        total: 4096,
      },
    },
    envs: [{ key: "NODE_ENV", value: "production" }],
    created: 1_690_001_000,
  };

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const startContainerServiceSpy = spyOn(service, "startContainer");
    startContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[":containerId"].start.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(startContainerServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should start container", async () => {
    const startContainerServiceSpy = spyOn(service, "startContainer");
    startContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[":containerId"].start.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(startContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(startContainerServiceSpy).toHaveBeenCalledWith({ containerId });
    expect(response.status).toBe(200);
    expect(result).toEqual(container);
  });

  test("should return not found error", async () => {
    const startContainerServiceSpy = spyOn(service, "startContainer");
    startContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: 404,
      },
    });

    const response = await createClient().containers[":containerId"].start.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(startContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });

  test("should return conflict error", async () => {
    const startContainerServiceSpy = spyOn(service, "startContainer");
    startContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: "Container is already running.",
        code: 409,
      },
    });

    const response = await createClient().containers[":containerId"].start.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(startContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(result).toEqual({
      message: "Container is already running.",
    });
  });

  test("should return internal server error", async () => {
    const startContainerServiceSpy = spyOn(service, "startContainer");
    startContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers[":containerId"].start.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(startContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});

describe("stop container", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;
  const containerId = "container-1";
  const container: Container = {
    id: containerId,
    name: "api",
    image: "ghcr.io/containers/api:latest",
    state: "exited",
    status: "exited",
    ports: [],
    envs: [],
    created: 1_690_002_000,
  };

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should stop container", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(stopContainerServiceSpy).toHaveBeenCalledWith({ containerId });
    expect(response.status).toBe(200);
    expect(result).toEqual(container);
  });

  test("should return not found error", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: 404,
      },
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });

  test("should return conflict error", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: "Container is not running.",
        code: 409,
      },
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(result).toEqual({ message: "Container is not running." });
  });

  test("should return internal server error", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});
