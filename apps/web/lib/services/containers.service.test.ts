import { afterEach, describe, expect, jest, test } from "bun:test";
import type { Container } from "@containers/shared";
import { mockAuthSession, mockAuthSessionError } from "@/lib/test/auth";
import { setupServiceMocks } from "@/lib/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, cookieStore, authClient } = setupServiceMocks();

const service = await import("./containers.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  jest.restoreAllMocks();
});

describe("list containers", () => {
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
