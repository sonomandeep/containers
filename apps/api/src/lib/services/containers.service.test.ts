import { afterEach, describe, expect, jest, mock, spyOn, test } from "bun:test";
import os from "node:os";
import type { Container, LaunchContainerInput } from "@containers/shared";
import type { RedisClient } from "bun";
import type Dockerode from "dockerode";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";

type FakeDocker = {
  listContainers: (
    options?: Dockerode.ContainerListOptions
  ) => Promise<Array<Dockerode.ContainerInfo>>;
  getContainer: (id: string) => Dockerode.Container;
  createContainer: (
    options: Dockerode.ContainerCreateOptions
  ) => Promise<Dockerode.Container>;
};

type FakeRedis = Pick<RedisClient, "hgetall">;

const fakeDocker: FakeDocker = {
  listContainers: (_options?: Dockerode.ContainerListOptions) =>
    Promise.reject(new Error("listContainers not mocked")),
  getContainer: (_id: string): Dockerode.Container => {
    throw new Error("getContainer not mocked");
  },
  createContainer: (_options: Dockerode.ContainerCreateOptions) =>
    Promise.reject(new Error("createContainer not mocked")),
};

mock.module("@/lib/agent", () => ({ docker: fakeDocker }));

const service = await import("@/lib/services/containers.service");
const agents = await import("@/routes/agents/agents.service");

afterEach(() => {
  jest.restoreAllMocks();
});

describe("listContainers", () => {
  test("returns containers from cache", async () => {
    const cachedContainers = [
      {
        id: "running-1",
        name: "api",
        image: "ghcr.io/containers/api:latest",
        state: "running",
        status: "Up 2 minutes",
        ports: [
          {
            ipVersion: "IPv4",
            public: 3000,
            private: 3000,
            type: "tcp",
          },
        ],
        envs: [
          { key: "NODE_ENV", value: "production" },
          { key: "COMPLEX", value: "foo=bar" },
        ],
        metrics: {
          cpu: 50,
          memory: {
            used: 800,
            total: 2000,
          },
        },
        created: 1_700_000_000,
        host: os.hostname(),
      },
      {
        id: "stopped-1",
        name: "worker",
        image: "ghcr.io/containers/worker:latest",
        state: "exited",
        status: "Exited (0) 2 hours ago",
        ports: [],
        envs: [{ key: "LOG_LEVEL", value: "debug" }],
        created: 1_700_000_100,
        host: os.hostname(),
      },
    ] satisfies Array<Container>;

    const redis = {
      hgetall: async () => ({
        "running-1": JSON.stringify(cachedContainers[0]),
        "stopped-1": JSON.stringify(cachedContainers[1]),
      }),
    } satisfies FakeRedis;

    const result = await service.listContainers(
      redis as unknown as RedisClient
    );

    expect(result.error).toBeNull();
    expect(result.data).toEqual(cachedContainers);
  });
});

describe("launchContainer", () => {
  test("normalizes input and launches container", async () => {
    const createdContainer = {
      id: "container-123",
      start: () => null,
    } as unknown as Dockerode.Container;

    const startSpy = spyOn(createdContainer, "start");
    const createSpy = spyOn(fakeDocker, "createContainer").mockResolvedValue(
      createdContainer
    );

    const input: LaunchContainerInput = {
      name: "api",
      image: "nginx:latest",
      restartPolicy: "always",
      command: 'echo "hello world"',
      cpu: "1.5",
      memory: "512",
      network: "bridge",
      envs: [
        { key: "NODE_ENV", value: "production" },
        { key: "EMPTY", value: "   " },
      ],
      ports: [
        { public: " 8080 ", private: "80 " },
        { public: "8443", private: " 443" },
        { public: "", private: "22" },
      ],
    };

    const result = await service.launchContainer(input);

    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      name: "api",
      Image: "nginx:latest",
      Cmd: ["echo", "hello world"],
      Env: ["NODE_ENV=production"],
      HostConfig: {
        RestartPolicy: { Name: "always" },
        NanoCpus: 1_500_000_000,
        Memory: 512 * 1024 * 1024,
        NetworkMode: "bridge",
        PortBindings: {
          "80/tcp": [{ HostPort: "8080" }],
          "443/tcp": [{ HostPort: "8443" }],
        },
      },
      ExposedPorts: {
        "80/tcp": expect.anything(),
        "443/tcp": expect.anything(),
      },
    });
    expect(result).toEqual({
      data: { id: "container-123" },
      error: null,
    });
  });

  test("returns not found when image is missing", async () => {
    const createSpy = spyOn(fakeDocker, "createContainer").mockRejectedValue({
      statusCode: HttpStatusCodes.NOT_FOUND,
      message: "Not Found",
    });

    const result = await service.launchContainer({
      name: "api",
      image: "missing:latest",
      restartPolicy: "always",
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns conflict when name already exists", async () => {
    const createSpy = spyOn(fakeDocker, "createContainer").mockRejectedValue({
      statusCode: HttpStatusCodes.CONFLICT,
      message: "Conflict",
    });

    const result = await service.launchContainer({
      name: "api",
      image: "nginx:latest",
      restartPolicy: "always",
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: null,
      error: {
        message: "A container with the same name already exists.",
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns internal server error for unknown failures", async () => {
    const createSpy = spyOn(fakeDocker, "createContainer").mockRejectedValue(
      new Error("boom")
    );

    const result = await service.launchContainer({
      name: "api",
      image: "nginx:latest",
      restartPolicy: "always",
    });

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("removeContainer", () => {
  test("removes container with force", async () => {
    const container = {
      remove: (_options?: Dockerode.ContainerRemoveOptions) => null,
    } as unknown as Dockerode.Container;

    const removeSpy = spyOn(container, "remove");
    const getContainerSpy = spyOn(fakeDocker, "getContainer").mockReturnValue(
      container
    );

    const result = await service.removeContainer({
      containerId: "container-1",
      force: true,
    });

    expect(getContainerSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith({ force: true });
    expect(result).toEqual({ data: null, error: null });
  });

  test("returns not found when container does not exist", async () => {
    const container = {
      remove: () => null,
    } as unknown as Dockerode.Container;

    spyOn(container, "remove").mockRejectedValue({
      statusCode: HttpStatusCodes.NOT_FOUND,
      message: "Not Found",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.removeContainer({ containerId: "missing" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns conflict when container is running", async () => {
    const container = {
      remove: () => null,
    } as unknown as Dockerode.Container;

    spyOn(container, "remove").mockRejectedValue({
      statusCode: HttpStatusCodes.CONFLICT,
      message: "Conflict",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.removeContainer({ containerId: "running" });

    expect(result).toEqual({
      data: null,
      error: {
        message:
          "Cannot delete a running container. Stop it and retry or force the removal.",
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns internal server error for unknown failures", async () => {
    const container = {
      remove: () => null,
    } as unknown as Dockerode.Container;

    spyOn(container, "remove").mockRejectedValue(new Error("boom"));
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.removeContainer({ containerId: "broken" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("stopContainer", () => {
  test("queues stop command and returns command id", () => {
    const sendToSpy = spyOn(agents.agentsRegistry, "sendTo").mockReturnValue({
      data: null,
      error: null,
    });

    const result = service.stopContainer("go-cli", "container-1");

    expect(sendToSpy).toHaveBeenCalledTimes(1);
    const [agentId, payload] = sendToSpy.mock.calls[0] as [string, string];
    expect(agentId).toBe("go-cli");

    const message = JSON.parse(payload) as {
      type: string;
      ts: string;
      data: {
        id: string;
        name: string;
        payload: {
          containerId: string;
        };
      };
    };

    expect(message.type).toBe("command");
    expect(message.data.name).toBe("container.stop");
    expect(message.data.payload.containerId).toBe("container-1");
    expect(message.data.id.length).toBeGreaterThan(0);
    expect(message.ts.length).toBeGreaterThan(0);

    expect(result.error).toBeNull();
    expect(result.data).toEqual({
      commandId: message.data.id,
    });
  });

  test("returns service unavailable when agent is offline", () => {
    spyOn(agents.agentsRegistry, "sendTo").mockReturnValue({
      data: null,
      error: "agent not available",
    });

    const result = service.stopContainer("go-cli", "container-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: "agent not available",
        code: HttpStatusCodes.SERVICE_UNAVAILABLE,
      },
    });
  });

  test("returns internal server error on unexpected failure", () => {
    spyOn(agents.agentsRegistry, "sendTo").mockImplementation(() => {
      throw new Error("boom");
    });

    const result = service.stopContainer("go-cli", "container-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("startContainer", () => {
  const inspectInfo = {
    Id: "container-1",
    Name: "/api",
    Config: {
      Image: "nginx:latest",
      Env: ["NODE_ENV=production"],
    },
    State: {
      Status: "running",
      Running: true,
    },
    NetworkSettings: {
      Ports: {
        "3000/tcp": [{ HostIp: "0.0.0.0", HostPort: "3000" }],
      },
    },
    HostConfig: {
      NanoCpus: 1_000_000_000,
    },
    Created: "2024-01-04T00:00:00.000Z",
  } as unknown as Dockerode.ContainerInspectInfo;

  const statsInfo = {
    cpu_stats: {
      cpu_usage: {
        total_usage: 150,
      },
      system_cpu_usage: 300,
      online_cpus: 1,
    },
    precpu_stats: {
      cpu_usage: {
        total_usage: 50,
      },
      system_cpu_usage: 100,
    },
    memory_stats: {
      usage: 1024,
      limit: 4096,
      stats: {
        cache: 24,
      },
    },
  } as unknown as Dockerode.ContainerStats;

  const expectedContainer: Container = {
    id: "container-1",
    name: "api",
    image: "nginx:latest",
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
    envs: [{ key: "NODE_ENV", value: "production" }],
    metrics: {
      cpu: 50,
      memory: {
        used: 1000,
        total: 4096,
      },
    },
    created: new Date("2024-01-04T00:00:00.000Z").getTime() / 1000,
    host: os.hostname(),
  };

  test("starts container and returns metrics", async () => {
    const container = {
      id: "container-1",
      start: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    const startSpy = spyOn(container, "start");
    const inspectSpy = spyOn(container, "inspect");
    const statsSpy = spyOn(container, "stats");
    const getContainerSpy = spyOn(fakeDocker, "getContainer").mockReturnValue(
      container
    );

    const result = await service.startContainer({ containerId: "container-1" });

    expect(getContainerSpy).toHaveBeenCalledTimes(2);
    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(inspectSpy).toHaveBeenCalledTimes(2);
    expect(statsSpy).toHaveBeenCalledWith({ stream: false });
    expect(result).toEqual({
      data: expectedContainer,
      error: null,
    });
  });

  test("returns conflict when container is already running", async () => {
    const container = {
      id: "container-1",
      start: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    spyOn(container, "start").mockRejectedValue({
      statusCode: HttpStatusCodes.CONFLICT,
      message: "Conflict",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.startContainer({ containerId: "container-1" });

    expect(result).toEqual({
      data: null,
      error: {
        message: "Container is already running.",
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns not found when container does not exist", async () => {
    const container = {
      id: "container-1",
      start: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    spyOn(container, "start").mockRejectedValue({
      statusCode: HttpStatusCodes.NOT_FOUND,
      message: "Not Found",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.startContainer({ containerId: "missing" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });
});

describe("restartContainer", () => {
  const inspectInfo = {
    Id: "container-1",
    Name: "/api",
    Config: {
      Image: "nginx:latest",
      Env: ["NODE_ENV=production"],
    },
    State: {
      Status: "running",
      Running: true,
    },
    NetworkSettings: {
      Ports: {
        "3000/tcp": [{ HostIp: "0.0.0.0", HostPort: "3000" }],
      },
    },
    HostConfig: {
      NanoCpus: 2_000_000_000,
    },
    Created: "2024-01-05T00:00:00.000Z",
  } as unknown as Dockerode.ContainerInspectInfo;

  const statsInfo = {
    cpu_stats: {
      cpu_usage: {
        total_usage: 400,
      },
      system_cpu_usage: 800,
      online_cpus: 2,
    },
    precpu_stats: {
      cpu_usage: {
        total_usage: 200,
      },
      system_cpu_usage: 400,
    },
    memory_stats: {
      usage: 2000,
      limit: 4000,
      stats: {
        cache: 100,
      },
    },
  } as unknown as Dockerode.ContainerStats;

  const expectedContainer: Container = {
    id: "container-1",
    name: "api",
    image: "nginx:latest",
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
    envs: [{ key: "NODE_ENV", value: "production" }],
    metrics: {
      cpu: 50,
      memory: {
        used: 1900,
        total: 4000,
      },
    },
    created: new Date("2024-01-05T00:00:00.000Z").getTime() / 1000,
    host: os.hostname(),
  };

  test("restarts container and returns metrics", async () => {
    const container = {
      id: "container-1",
      restart: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    const restartSpy = spyOn(container, "restart");
    const inspectSpy = spyOn(container, "inspect");
    const statsSpy = spyOn(container, "stats");
    const getContainerSpy = spyOn(fakeDocker, "getContainer").mockReturnValue(
      container
    );

    const result = await service.restartContainer({
      containerId: "container-1",
    });

    expect(getContainerSpy).toHaveBeenCalledTimes(2);
    expect(restartSpy).toHaveBeenCalledTimes(1);
    expect(inspectSpy).toHaveBeenCalledTimes(2);
    expect(statsSpy).toHaveBeenCalledWith({ stream: false });
    expect(result).toEqual({
      data: expectedContainer,
      error: null,
    });
  });

  test("returns conflict when container is already running", async () => {
    const container = {
      id: "container-1",
      restart: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    spyOn(container, "restart").mockRejectedValue({
      statusCode: HttpStatusCodes.NOT_MODIFIED,
      message: "Not Modified",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.restartContainer({
      containerId: "container-1",
    });

    expect(result).toEqual({
      data: null,
      error: {
        message: "Container is already running.",
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns not found when container does not exist", async () => {
    const container = {
      id: "container-1",
      restart: () => null,
      inspect: () => inspectInfo,
      stats: () => statsInfo,
    } as unknown as Dockerode.Container;

    spyOn(container, "restart").mockRejectedValue({
      statusCode: HttpStatusCodes.NOT_FOUND,
      message: "Not Found",
    });
    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.restartContainer({
      containerId: "missing",
    });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });
});
