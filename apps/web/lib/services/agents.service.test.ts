import { afterEach, describe, expect, jest, test } from "bun:test";
import type { Agent } from "@containers/shared";
import { mockAuthSession, mockAuthSessionError } from "@/test/auth";
import { setupServiceMocks } from "@/test/mocks";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost";

const { apiMock, redirectMock, updateTagMock, cookieStore, authClient } =
  setupServiceMocks();

const service = await import("./agents.service");

afterEach(() => {
  apiMock.mockReset();
  redirectMock.mockReset();
  updateTagMock.mockReset();
  jest.restoreAllMocks();
});

describe("listAgents", () => {
  test("returns agents when api succeeds", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const agents: Array<Agent> = [
      {
        id: "agent-1",
        organizationId: "org-1",
        name: "edge-agent",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
      {
        id: "agent-2",
        organizationId: "org-1",
        name: "worker-agent",
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
      },
    ];

    apiMock.mockResolvedValue({ data: agents, error: null });

    const result = await service.listAgents();

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/agents", {
      method: "get",
      headers: {
        Cookie: cookieStore.toString(),
      },
      output: expect.anything(),
      next: {
        tags: ["agents"],
      },
    });
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: agents, error: null });
  });

  test("returns error when api responds with error", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: [], error: apiError });

    const result = await service.listAgents();

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while fetching agents.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service.listAgents().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

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

    const error = await service.listAgents().catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
  });
});

describe("createAgent", () => {
  test("creates an agent and invalidates agents cache tag", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const input = {
      name: "collector-1",
    };
    const createdAgent: Agent = {
      id: "agent-3",
      organizationId: "org-1",
      name: "collector-1",
      createdAt: "2026-01-05T00:00:00.000Z",
      updatedAt: "2026-01-05T00:00:00.000Z",
    };

    apiMock.mockResolvedValue({ data: createdAgent, error: null });

    const result = await service.createAgent(input);

    expect(getSessionSpy).toHaveBeenCalledWith({
      fetchOptions: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledWith("/agents", {
      method: "post",
      headers: {
        Cookie: cookieStore.toString(),
        "content-type": "application/json",
      },
      body: JSON.stringify(input),
      output: expect.anything(),
    });
    expect(updateTagMock).toHaveBeenCalledWith("agents");
    expect(result).toEqual({ data: createdAgent, error: null });
  });

  test("returns validation error when input is invalid", async () => {
    const getSessionSpy = mockAuthSession(authClient);

    const result = await service.createAgent({ name: "" });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({ data: null, error: "validation error" });
  });

  test("returns duplicate-name error when api responds with 409", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "duplicate",
      status: 409,
      statusText: "Conflict",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.createAgent({ name: "collector-1" });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "An agent with this name already exists.",
    });
  });

  test("returns error when api responds with non-conflict failure", async () => {
    const getSessionSpy = mockAuthSession(authClient);
    const apiError = {
      message: "api error",
      status: 500,
      statusText: "Internal Server Error",
    };

    apiMock.mockResolvedValue({ data: null, error: apiError });

    const result = await service.createAgent({ name: "collector-1" });

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).not.toHaveBeenCalled();
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(updateTagMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: null,
      error: "Unexpected error while creating the agent.",
    });
  });

  test("redirects when session is missing", async () => {
    const redirectErrorMessage = "NEXT_REDIRECT";
    const getSessionSpy = mockAuthSession(authClient, null);

    redirectMock.mockImplementation(() => {
      throw new Error(redirectErrorMessage);
    });

    const error = await service
      .createAgent({ name: "collector-1" })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

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

    const error = await service
      .createAgent({ name: "collector-1" })
      .catch((caught) => caught);

    expect(error).toBeInstanceOf(Error);
    if (error instanceof Error) {
      expect(error.message).toBe(redirectErrorMessage);
    }

    expect(getSessionSpy).toHaveBeenCalledTimes(1);
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
    expect(apiMock).not.toHaveBeenCalled();
    expect(updateTagMock).not.toHaveBeenCalled();
  });
});
