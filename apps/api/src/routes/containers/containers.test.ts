import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  spyOn,
  test,
} from "bun:test";
import type { Container, LaunchContainerInput } from "@containers/shared";
import type { RedisClient } from "bun";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-app";
import { authMiddleware } from "@/lib/middlewares/auth.middleware";
import { createMockSession, mockAuthSession } from "@/test/auth";
import router from "./containers.index";
import * as service from "./containers.service";

const createClient = () => {
  const app = createRouter();
  const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    fatal: jest.fn(),
    info: jest.fn(),
    trace: jest.fn(),
    child: jest.fn(),
  };
  logger.child.mockReturnValue(logger);

  app.use("*", async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (session) {
      c.set("user", session.user);
      c.set("session", session.session);
    } else {
      c.set("user", null);
      c.set("session", null);
    }

    c.set("redis", {} as RedisClient);
    c.set("logger", logger as never);

    await next();
  });

  app.use("/containers/*", authMiddleware);

  return testClient(app.route("/", router));
};

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
    listContainersServiceSpy.mockResolvedValue({ data: [], error: null });

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should return empty containers list", async () => {
    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockResolvedValue({ data: [], error: null });

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(listContainersServiceSpy).toHaveBeenCalledWith(
      expect.anything(),
      "org-1"
    );
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

    listContainersServiceSpy.mockResolvedValue({
      data: containers,
      error: null,
    });

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(listContainersServiceSpy).toHaveBeenCalledWith(
      expect.anything(),
      "org-1"
    );
    expect(response.status).toBe(200);
    expect(result).toEqual(containers);
  });

  test("should return 500 when service returns error", async () => {
    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).toHaveBeenCalledTimes(1);
    expect(listContainersServiceSpy).toHaveBeenCalledWith(
      expect.anything(),
      "org-1"
    );
    expect(response.status).toBe(500);
    expect(result).toMatchObject({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });

  test("should return bad request when active workspace is missing", async () => {
    const session = createMockSession();
    getSessionSpy.mockResolvedValueOnce({
      ...session,
      session: {
        ...session.session,
        activeOrganizationId: null,
      },
    });

    const listContainersServiceSpy = spyOn(service, "listContainers");
    listContainersServiceSpy.mockResolvedValue({ data: [], error: null });

    const response = await createClient().containers.$get();
    const result = await response.json();

    expect(listContainersServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(result).toEqual({ message: "Active workspace is required." });
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
    expect(result).toEqual({
      message: "container launched",
      id: "container-1",
    });
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

    const response = await createClient().containers[
      ":containerId"
    ].start.$post({
      param: { containerId },
    });
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

    const response = await createClient().containers[
      ":containerId"
    ].start.$post({
      param: { containerId },
    });
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

    const response = await createClient().containers[
      ":containerId"
    ].start.$post({
      param: { containerId },
    });
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

    const response = await createClient().containers[
      ":containerId"
    ].start.$post({
      param: { containerId },
    });
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

    const response = await createClient().containers[
      ":containerId"
    ].start.$post({
      param: { containerId },
    });
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

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockReturnValue({
      data: {
        commandId: "cmd-1",
      },
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

  test("should queue stop command", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockReturnValue({
      data: {
        commandId: "cmd-1",
      },
      error: null,
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(stopContainerServiceSpy).toHaveBeenCalledWith("go-cli", containerId);
    expect(response.status).toBe(202);
    expect(result).toEqual({
      commandId: "cmd-1",
      status: "queued",
    });
  });

  test("should return service unavailable error", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockReturnValue({
      data: null,
      error: {
        message: "agent not available",
        code: 503,
      },
    });

    const response = await createClient().containers[":containerId"].stop.$post(
      {
        param: { containerId },
      }
    );
    const result = await response.json();

    expect(stopContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(503);
    expect(result).toEqual({ message: "agent not available" });
  });

  test("should return internal server error", async () => {
    const stopContainerServiceSpy = spyOn(service, "stopContainer");
    stopContainerServiceSpy.mockReturnValue({
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

describe("restart container", () => {
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
      cpu: 1.1,
      memory: {
        used: 4096,
        total: 8192,
      },
    },
    envs: [{ key: "NODE_ENV", value: "production" }],
    created: 1_690_003_000,
  };

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const restartContainerServiceSpy = spyOn(service, "restartContainer");
    restartContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[
      ":containerId"
    ].restart.$post({
      param: { containerId },
    });
    const result = await response.json();

    expect(restartContainerServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should restart container", async () => {
    const restartContainerServiceSpy = spyOn(service, "restartContainer");
    restartContainerServiceSpy.mockResolvedValue({
      data: container,
      error: null,
    });

    const response = await createClient().containers[
      ":containerId"
    ].restart.$post({
      param: { containerId },
    });
    const result = await response.json();

    expect(restartContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(restartContainerServiceSpy).toHaveBeenCalledWith({ containerId });
    expect(response.status).toBe(200);
    expect(result).toEqual(container);
  });

  test("should return not found error", async () => {
    const restartContainerServiceSpy = spyOn(service, "restartContainer");
    restartContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: 404,
      },
    });

    const response = await createClient().containers[
      ":containerId"
    ].restart.$post({
      param: { containerId },
    });
    const result = await response.json();

    expect(restartContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });

  test("should return conflict error", async () => {
    const restartContainerServiceSpy = spyOn(service, "restartContainer");
    restartContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: "Container is already running.",
        code: 409,
      },
    });

    const response = await createClient().containers[
      ":containerId"
    ].restart.$post({
      param: { containerId },
    });
    const result = await response.json();

    expect(restartContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(result).toEqual({
      message: "Container is already running.",
    });
  });

  test("should return internal server error", async () => {
    const restartContainerServiceSpy = spyOn(service, "restartContainer");
    restartContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers[
      ":containerId"
    ].restart.$post({
      param: { containerId },
    });
    const result = await response.json();

    expect(restartContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});

describe("remove container", () => {
  let getSessionSpy: ReturnType<typeof spyOn>;
  const containerId = "container-1";

  beforeEach(() => {
    getSessionSpy = mockAuthSession();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return unauthorized error", async () => {
    getSessionSpy.mockResolvedValueOnce(null);

    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: {},
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(result).toEqual({ message: HttpStatusPhrases.UNAUTHORIZED });
  });

  test("should remove container without force", async () => {
    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: {},
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(removeContainerServiceSpy).toHaveBeenCalledWith({
      containerId,
      force: undefined,
    });
    expect(response.status).toBe(200);
    expect(result).toEqual({ message: "container deleted" });
  });

  test("should remove container with force", async () => {
    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: { force: true },
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(removeContainerServiceSpy).toHaveBeenCalledWith({
      containerId,
      force: true,
    });
    expect(response.status).toBe(200);
    expect(result).toEqual({ message: "container deleted" });
  });

  test("should return not found error", async () => {
    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: 404,
      },
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: {},
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });

  test("should return conflict error", async () => {
    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message:
          "Cannot delete a running container. Stop it and retry or force the removal.",
        code: 409,
      },
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: {},
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(409);
    expect(result).toEqual({
      message:
        "Cannot delete a running container. Stop it and retry or force the removal.",
    });
  });

  test("should return internal server error", async () => {
    const removeContainerServiceSpy = spyOn(service, "removeContainer");
    removeContainerServiceSpy.mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: 500,
      },
    });

    const response = await createClient().containers[":containerId"].$delete({
      param: { containerId },
      query: {},
    });
    const result = await response.json();

    expect(removeContainerServiceSpy).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(500);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});
