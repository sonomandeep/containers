import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import type { Agent } from "@containers/shared";
import type { RedisClient } from "bun";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { createRouter } from "@/lib/create-app";
import router from "./agents.index";
import * as service from "./agents.service";

type SessionValue = {
  activeOrganizationId?: string;
} | null;

const createAgent = (overrides: Partial<Agent> = {}): Agent => ({
  id: "agent-1",
  organizationId: "org-1",
  name: "primary-agent",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
  ...overrides,
});

const createClient = (
  session: SessionValue = { activeOrganizationId: "org-1" }
) => {
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
    c.set("session", session as never);
    c.set("user", null);
    c.set("redis", {} as RedisClient);
    c.set("logger", logger as never);
    await next();
  });

  return {
    app: app.route("/", router),
    logger,
  };
};

const requestJson = async (response: Response) => {
  const body: unknown = await response.json();

  return body;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe("create handler", () => {
  test("returns bad request when active workspace is missing", async () => {
    const { app } = createClient({});
    const createAgentSpy = spyOn(service, "createAgent").mockResolvedValue({
      data: createAgent(),
      error: null,
    });

    const response = await app.request("http://localhost/agents", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "new-agent",
      }),
    });
    const result = await requestJson(response);

    expect(createAgentSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
    expect(result).toEqual({ message: "Active workspace is required." });
  });

  test("returns created agent on success", async () => {
    const agent = createAgent();
    const { app } = createClient({ activeOrganizationId: "org-1" });
    const createAgentSpy = spyOn(service, "createAgent").mockResolvedValue({
      data: agent,
      error: null,
    });

    const response = await app.request("http://localhost/agents", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "new-agent",
      }),
    });
    const result = await requestJson(response);

    expect(createAgentSpy).toHaveBeenCalledWith("org-1", {
      name: "new-agent",
    });
    expect(response.status).toBe(HttpStatusCodes.CREATED);
    expect(result).toEqual(agent);
  });

  test("propagates service error code and message", async () => {
    const { app, logger } = createClient({ activeOrganizationId: "org-1" });
    spyOn(service, "createAgent").mockResolvedValue({
      data: null,
      error: {
        message: "duplicate",
        code: HttpStatusCodes.CONFLICT,
      },
    });

    const response = await app.request("http://localhost/agents", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "new-agent",
      }),
    });
    const result = await requestJson(response);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(HttpStatusCodes.CONFLICT);
    expect(result).toEqual({ message: "duplicate" });
  });
});

describe("list handler", () => {
  test("returns bad request when active workspace is missing", async () => {
    const { app } = createClient({});
    const listAgentsSpy = spyOn(service, "listAgents").mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await app.request("http://localhost/agents");
    const result = await requestJson(response);

    expect(listAgentsSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
    expect(result).toEqual({ message: "Active workspace is required." });
  });

  test("returns agents list on success", async () => {
    const agents = [createAgent()];
    const { app } = createClient({ activeOrganizationId: "org-1" });
    const listAgentsSpy = spyOn(service, "listAgents").mockResolvedValue({
      data: agents,
      error: null,
    });

    const response = await app.request("http://localhost/agents");
    const result = await requestJson(response);

    expect(listAgentsSpy).toHaveBeenCalledWith("org-1");
    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(result).toEqual(agents);
  });

  test("returns internal server error when service fails", async () => {
    const { app, logger } = createClient({ activeOrganizationId: "org-1" });
    spyOn(service, "listAgents").mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });

    const response = await app.request("http://localhost/agents");
    const result = await requestJson(response);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    expect(result).toEqual({
      message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
    });
  });
});

describe("getById handler", () => {
  test("returns bad request when active workspace is missing", async () => {
    const { app } = createClient({});
    const getAgentByIdSpy = spyOn(service, "getAgentById").mockResolvedValue({
      data: createAgent(),
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1");
    const result = await requestJson(response);

    expect(getAgentByIdSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
    expect(result).toEqual({ message: "Active workspace is required." });
  });

  test("returns requested agent on success", async () => {
    const agent = createAgent();
    const { app } = createClient({ activeOrganizationId: "org-1" });
    const getAgentByIdSpy = spyOn(service, "getAgentById").mockResolvedValue({
      data: agent,
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1");
    const result = await requestJson(response);

    expect(getAgentByIdSpy).toHaveBeenCalledWith("org-1", "agent-1");
    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(result).toEqual(agent);
  });

  test("returns not found when service cannot find the agent", async () => {
    const { app } = createClient({ activeOrganizationId: "org-1" });
    spyOn(service, "getAgentById").mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });

    const response = await app.request("http://localhost/agents/missing");
    const result = await requestJson(response);

    expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });
});

describe("update handler", () => {
  test("returns bad request when active workspace is missing", async () => {
    const { app } = createClient({});
    const updateAgentSpy = spyOn(service, "updateAgent").mockResolvedValue({
      data: createAgent(),
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "updated-name" }),
    });
    const result = await requestJson(response);

    expect(updateAgentSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
    expect(result).toEqual({ message: "Active workspace is required." });
  });

  test("returns updated agent on success", async () => {
    const agent = createAgent({ name: "updated-name" });
    const { app } = createClient({ activeOrganizationId: "org-1" });
    const updateAgentSpy = spyOn(service, "updateAgent").mockResolvedValue({
      data: agent,
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "updated-name" }),
    });
    const result = await requestJson(response);

    expect(updateAgentSpy).toHaveBeenCalledWith("org-1", "agent-1", {
      name: "updated-name",
    });
    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(result).toEqual(agent);
  });

  test("returns conflict when service reports duplicate name", async () => {
    const { app } = createClient({ activeOrganizationId: "org-1" });
    spyOn(service, "updateAgent").mockResolvedValue({
      data: null,
      error: {
        message: "duplicate",
        code: HttpStatusCodes.CONFLICT,
      },
    });

    const response = await app.request("http://localhost/agents/agent-1", {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "duplicate" }),
    });
    const result = await requestJson(response);

    expect(response.status).toBe(HttpStatusCodes.CONFLICT);
    expect(result).toEqual({ message: "duplicate" });
  });
});

describe("remove handler", () => {
  test("returns bad request when active workspace is missing", async () => {
    const { app } = createClient({});
    const removeAgentSpy = spyOn(service, "removeAgent").mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1", {
      method: "DELETE",
    });
    const result = await requestJson(response);

    expect(removeAgentSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
    expect(result).toEqual({ message: "Active workspace is required." });
  });

  test("returns success payload when deletion succeeds", async () => {
    const { app } = createClient({ activeOrganizationId: "org-1" });
    const removeAgentSpy = spyOn(service, "removeAgent").mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await app.request("http://localhost/agents/agent-1", {
      method: "DELETE",
    });
    const result = await requestJson(response);

    expect(removeAgentSpy).toHaveBeenCalledWith("org-1", "agent-1");
    expect(response.status).toBe(HttpStatusCodes.OK);
    expect(result).toEqual({ message: "agent deleted" });
  });

  test("returns not found when service cannot delete the agent", async () => {
    const { app } = createClient({ activeOrganizationId: "org-1" });
    spyOn(service, "removeAgent").mockResolvedValue({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });

    const response = await app.request("http://localhost/agents/missing", {
      method: "DELETE",
    });
    const result = await requestJson(response);

    expect(response.status).toBe(HttpStatusCodes.NOT_FOUND);
    expect(result).toEqual({ message: HttpStatusPhrases.NOT_FOUND });
  });
});
