import { afterEach, describe, expect, jest, test } from "bun:test";
import type { Container } from "@containers/shared";
import { mockAuthSession, mockAuthSessionError } from "@/lib/test/auth";
import { setupServiceMocks } from "@/lib/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, updateTagMock, cookieStore, authClient } =
  setupServiceMocks();

const service = await import("./containers.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  updateTagMock.mockReset();
  jest.restoreAllMocks();
});

describe("listContainers", () => {
  test("returns containers when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const containers: Array<Container> = [
      {
        id: "container-1",
        name: "api",
        image: "ghcr.io/containers/api:latest",
        state: "running",
        status: "Up 1 minute",
        ports: [
          {
            ipVersion: "IPv4",
            private: 3000,
            public: 3000,
            type: "tcp",
          },
        ],
        metrics: {
          cpu: 10,
          memory: {
            used: 256,
            total: 1024,
          },
        },
        envs: [{ key: "NODE_ENV", value: "production" }],
        host: "host-1",
        created: 1_700_000_000,
      },
    ];

    apiMock.mockResolvedValue({ data: containers, error: null });

    const result = await service.listContainers();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/containers", {
      method: "get",
      headers: {
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
      next: {
        tags: ["containers"],
      },
    });
    expect(result).toEqual({ data: containers, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: [], error: apiError });

    const result = await service.listContainers();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ data: null, error: apiError });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.listContainers()).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.listContainers()).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });
});

describe("launchContainer", () => {
  test("creates container and updates cache when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = {
      name: "api",
      image: "nginx:latest",
      restartPolicy: "always",
      command: "echo hello",
      cpu: "1",
      memory: "512",
      network: "bridge",
    };

    apiMock.mockResolvedValue({ error: null });

    const result = await service.launchContainer(input);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/containers", {
      method: "post",
      body: JSON.stringify({
        name: input.name,
        image: input.image,
        restartPolicy: input.restartPolicy,
        command: input.command,
        cpu: input.cpu,
        memory: input.memory,
        network: input.network,
        envs: [],
        ports: [],
      }),
      headers: {
        Cookie: cookieStore.toString(),
        "content-type": "application/json",
      },
    });
    expect(updateTagMock).toHaveBeenCalledWith("/containers");
    expect(result).toEqual({ data: null, error: null });
  });

  test("returns validation error when input is invalid", async () => {
    const getSessionSpy = mockAuthSession(authClient);

    const result = await service.launchContainer({ name: "" });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "validation error" });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ error: apiError });

    const result = await service.launchContainer({
      name: "api",
      image: "nginx:latest",
      restartPolicy: "always",
    });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while starting the container.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.launchContainer({})).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.launchContainer({})).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});

describe("startContainer", () => {
  test("starts container and returns data when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const containerId = "container/with space";
    const container: Container = {
      id: "container-1",
      name: "api",
      image: "nginx:latest",
      state: "running",
      status: "Up 1 minute",
      ports: [],
      envs: [],
      created: 1_700_000_000,
    };

    apiMock.mockResolvedValue({ data: container, error: null });

    const result = await service.startContainer(containerId);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith(
      "/containers/container%2Fwith%20space/start",
      {
        method: "post",
        headers: {
          Cookie: cookieStore.toString(),
        },
        output: expect.anything(),
      }
    );
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: container, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.startContainer("container-1");

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while starting the container.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.startContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.startContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});

describe("restartContainer", () => {
  test("restarts container and returns data when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const containerId = "container/with space";
    const container: Container = {
      id: "container-1",
      name: "api",
      image: "nginx:latest",
      state: "running",
      status: "Up 1 minute",
      ports: [],
      envs: [],
      created: 1_700_000_000,
    };

    apiMock.mockResolvedValue({ data: container, error: null });

    const result = await service.restartContainer(containerId);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith(
      "/containers/container%2Fwith%20space/restart",
      {
        method: "post",
        headers: {
          Cookie: cookieStore.toString(),
        },
        output: expect.anything(),
      }
    );
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: container, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.restartContainer("container-1");

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while restarting the container.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.restartContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.restartContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});

describe("stopContainer", () => {
  test("stops container and returns data when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const containerId = "container/with space";
    const container: Container = {
      id: "container-1",
      name: "api",
      image: "nginx:latest",
      state: "exited",
      status: "Exited (0) 1 second ago",
      ports: [],
      envs: [],
      created: 1_700_000_000,
    };

    apiMock.mockResolvedValue({ data: container, error: null });

    const result = await service.stopContainer(containerId);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith(
      "/containers/container%2Fwith%20space/stop",
      {
        method: "post",
        headers: {
          Cookie: cookieStore.toString(),
        },
        output: expect.anything(),
      }
    );
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: container, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.stopContainer("container-1");

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while stopping the container.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.stopContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });

  test("redirects when session has an error", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSessionError(
      authClient,
      new Error("Auth failed")
    );

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    await expect(service.stopContainer("container-1")).rejects.toThrow(
      redirectErrorMessage
    );

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});
