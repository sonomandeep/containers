import { afterEach, describe, expect, jest, spyOn, test } from "bun:test";
import crypto from "node:crypto";
import type { Agent, Container } from "@containers/shared";
import type { RedisClient } from "bun";
import type { WSContext } from "hono/ws";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { db } from "@/db";
import { agent as agentTable } from "@/db/schema";
import {
  AgentsRegistry,
  createAgent,
  getAgentById,
  getAgentConnectionInfo,
  listAgents,
  removeAgent,
  storeContainer,
  storeContainersSnapshot,
  updateAgent,
} from "./agents.service";

type AgentRecord = typeof agentTable.$inferSelect;

const DUPLICATE_AGENT_NAME_MESSAGE =
  "An agent with the same name already exists in this workspace.";

const createAgentRecord = (
  overrides: Partial<AgentRecord> = {}
): AgentRecord => ({
  id: "agent-1",
  organizationId: "org-1",
  name: "primary-agent",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  ...overrides,
});

const toAgentResponse = (record: AgentRecord): Agent => ({
  id: record.id,
  organizationId: record.organizationId,
  name: record.name,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

const createContainer = (id: string): Container => ({
  id,
  name: `container-${id}`,
  image: "nginx:latest",
  state: "running",
  status: "Up 2 minutes",
  ports: [],
  envs: [{ key: "NODE_ENV", value: "production" }],
  created: 1_700_000_000,
});

const createWs = (state: number, sendImpl?: () => void): WSContext<unknown> =>
  ({
    readyState: state,
    send: jest.fn(sendImpl),
  }) as unknown as WSContext<unknown>;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("listAgents", () => {
  test("returns mapped agents", async () => {
    const record = createAgentRecord();
    const orderBy = jest.fn().mockResolvedValue([record]);
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });

    const selectSpy = spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await listAgents("org-1");

    expect(selectSpy).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith(agentTable);
    expect(where).toHaveBeenCalledTimes(1);
    expect(orderBy).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: [toAgentResponse(record)],
      error: null,
    });
  });

  test("returns internal server error on database failure", async () => {
    const orderBy = jest.fn().mockRejectedValue(new Error("boom"));
    const where = jest.fn().mockReturnValue({ orderBy });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await listAgents("org-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("getAgentById", () => {
  test("returns requested agent", async () => {
    const record = createAgentRecord({ id: "agent-7" });
    const limit = jest.fn().mockResolvedValue([record]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentById("org-1", "agent-7");

    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      data: toAgentResponse(record),
      error: null,
    });
  });

  test("returns not found when no record exists", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentById("org-1", "missing");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns internal server error on database failure", async () => {
    const limit = jest.fn().mockRejectedValue(new Error("boom"));
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentById("org-1", "agent-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("getAgentConnectionInfo", () => {
  test("returns connection info when the agent exists", async () => {
    const record = {
      id: "agent-7",
      organizationId: "org-9",
    };
    const limit = jest.fn().mockResolvedValue([record]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentConnectionInfo("agent-7");

    expect(limit).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      data: {
        id: "agent-7",
        organizationId: "org-9",
      },
      error: null,
    });
  });

  test("returns not found when the agent does not exist", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentConnectionInfo("missing");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns internal server error on database failure", async () => {
    const limit = jest.fn().mockRejectedValue(new Error("boom"));
    const where = jest.fn().mockReturnValue({ limit });
    const from = jest.fn().mockReturnValue({ where });

    spyOn(db, "select").mockReturnValue({ from } as never);

    const result = await getAgentConnectionInfo("agent-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("createAgent", () => {
  test("creates an agent and returns mapped payload", async () => {
    const generatedId = "11111111-1111-4111-8111-111111111111";
    const record = createAgentRecord({ id: generatedId, name: "collector-1" });
    const returning = jest.fn().mockResolvedValue([record]);
    const values = jest.fn().mockReturnValue({ returning });
    const insertSpy = spyOn(db, "insert").mockReturnValue({ values } as never);

    spyOn(crypto, "randomUUID").mockReturnValue(generatedId);

    const result = await createAgent("org-1", { name: "collector-1" });

    expect(insertSpy).toHaveBeenCalledWith(agentTable);
    expect(values).toHaveBeenCalledWith({
      id: generatedId,
      organizationId: "org-1",
      name: "collector-1",
    });
    expect(result).toEqual({
      data: toAgentResponse(record),
      error: null,
    });
  });

  test("returns conflict for duplicate name with direct error code", async () => {
    const returning = jest.fn().mockRejectedValue({ code: "23505" });
    const values = jest.fn().mockReturnValue({ returning });

    spyOn(db, "insert").mockReturnValue({ values } as never);

    const result = await createAgent("org-1", { name: "collector-1" });

    expect(result).toEqual({
      data: null,
      error: {
        message: DUPLICATE_AGENT_NAME_MESSAGE,
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns conflict for duplicate name with nested cause code", async () => {
    const returning = jest.fn().mockRejectedValue({
      cause: {
        cause: {
          code: "23505",
        },
      },
    });
    const values = jest.fn().mockReturnValue({ returning });

    spyOn(db, "insert").mockReturnValue({ values } as never);

    const result = await createAgent("org-1", { name: "collector-1" });

    expect(result).toEqual({
      data: null,
      error: {
        message: DUPLICATE_AGENT_NAME_MESSAGE,
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns internal server error when insert returns no row", async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const values = jest.fn().mockReturnValue({ returning });

    spyOn(db, "insert").mockReturnValue({ values } as never);

    const result = await createAgent("org-1", { name: "collector-1" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });

  test("returns internal server error for unknown failures", async () => {
    const returning = jest.fn().mockRejectedValue(new Error("boom"));
    const values = jest.fn().mockReturnValue({ returning });

    spyOn(db, "insert").mockReturnValue({ values } as never);

    const result = await createAgent("org-1", { name: "collector-1" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("updateAgent", () => {
  test("updates and returns mapped agent", async () => {
    const record = createAgentRecord({ id: "agent-9", name: "updated-name" });
    const returning = jest.fn().mockResolvedValue([record]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });

    spyOn(db, "update").mockReturnValue({ set } as never);

    const result = await updateAgent("org-1", "agent-9", {
      name: "updated-name",
    });

    expect(set).toHaveBeenCalledWith({ name: "updated-name" });
    expect(result).toEqual({
      data: toAgentResponse(record),
      error: null,
    });
  });

  test("returns not found when no agent is updated", async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });

    spyOn(db, "update").mockReturnValue({ set } as never);

    const result = await updateAgent("org-1", "missing", { name: "updated" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns conflict for duplicate name", async () => {
    const returning = jest.fn().mockRejectedValue({
      cause: { code: "23505" },
    });
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });

    spyOn(db, "update").mockReturnValue({ set } as never);

    const result = await updateAgent("org-1", "agent-1", { name: "duplicate" });

    expect(result).toEqual({
      data: null,
      error: {
        message: DUPLICATE_AGENT_NAME_MESSAGE,
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns internal server error for unknown failures", async () => {
    const returning = jest.fn().mockRejectedValue(new Error("boom"));
    const where = jest.fn().mockReturnValue({ returning });
    const set = jest.fn().mockReturnValue({ where });

    spyOn(db, "update").mockReturnValue({ set } as never);

    const result = await updateAgent("org-1", "agent-1", { name: "updated" });

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("removeAgent", () => {
  test("returns success when agent is removed", async () => {
    const returning = jest.fn().mockResolvedValue([{ id: "agent-1" }]);
    const where = jest.fn().mockReturnValue({ returning });

    spyOn(db, "delete").mockReturnValue({ where } as never);

    const result = await removeAgent("org-1", "agent-1");

    expect(result).toEqual({ data: null, error: null });
  });

  test("returns not found when no rows are deleted", async () => {
    const returning = jest.fn().mockResolvedValue([]);
    const where = jest.fn().mockReturnValue({ returning });

    spyOn(db, "delete").mockReturnValue({ where } as never);

    const result = await removeAgent("org-1", "missing");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.NOT_FOUND,
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns internal server error on database failure", async () => {
    const returning = jest.fn().mockRejectedValue(new Error("boom"));
    const where = jest.fn().mockReturnValue({ returning });

    spyOn(db, "delete").mockReturnValue({ where } as never);

    const result = await removeAgent("org-1", "agent-1");

    expect(result).toEqual({
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("AgentsRegistry", () => {
  test("returns an active client by id", () => {
    const registry = new AgentsRegistry();
    const ws = createWs(WebSocket.OPEN);

    registry.add("agent-1", ws);

    const result = registry.get("agent-1");

    expect(result).toEqual({ data: ws, error: null });
  });

  test("returns not found when client is closed", () => {
    const registry = new AgentsRegistry();
    registry.add("agent-1", createWs(WebSocket.CLOSED));

    const result = registry.get("agent-1");

    expect(result).toEqual({ data: null, error: "agent not found" });
  });

  test("lists only active agents and removes closed ones", () => {
    const registry = new AgentsRegistry();
    const openWs = createWs(WebSocket.OPEN);
    const closedWs = createWs(WebSocket.CLOSED);

    registry.add("open-agent", openWs);
    registry.add("closed-agent", closedWs);

    const agents = registry.getAgents();

    expect(agents).toEqual([{ id: "open-agent", client: openWs }]);
    expect(registry.size()).toBe(1);
  });

  test("sendTo returns not available when agent does not exist", () => {
    const registry = new AgentsRegistry();

    const result = registry.sendTo("missing", "payload");

    expect(result).toEqual({ data: null, error: "agent not available" });
  });

  test("sendTo removes and fails closed agents", () => {
    const registry = new AgentsRegistry();
    registry.add("agent-1", createWs(WebSocket.CLOSED));

    const result = registry.sendTo("agent-1", "payload");

    expect(result).toEqual({ data: null, error: "agent not available" });
    expect(registry.size()).toBe(0);
  });

  test("sendTo removes and fails when send throws", () => {
    const registry = new AgentsRegistry();
    const ws = createWs(WebSocket.OPEN, () => {
      throw new Error("boom");
    });
    registry.add("agent-1", ws);

    const result = registry.sendTo("agent-1", "payload");

    expect(result).toEqual({ data: null, error: "agent not available" });
    expect(registry.size()).toBe(0);
  });

  test("broadcast sends to active clients and prunes invalid ones", () => {
    const registry = new AgentsRegistry();
    const openWs = createWs(WebSocket.OPEN);
    const throwingWs = createWs(WebSocket.OPEN, () => {
      throw new Error("boom");
    });
    const closedWs = createWs(WebSocket.CLOSED);

    registry.add("open-agent", openWs);
    registry.add("throwing-agent", throwingWs);
    registry.add("closed-agent", closedWs);

    registry.broadcast("payload");

    expect(openWs.send).toHaveBeenCalledWith("payload");
    expect(throwingWs.send).toHaveBeenCalledWith("payload");
    expect(registry.size()).toBe(1);
  });
});

describe("storeContainer", () => {
  test("deletes cached container for removal events", async () => {
    const redis = {
      hdel: jest.fn().mockResolvedValue(1),
      hset: jest.fn().mockResolvedValue(1),
    } as unknown as RedisClient;
    const container = createContainer("container-1");

    await storeContainer(redis, "container.remove", container);

    expect(redis.hdel).toHaveBeenCalledWith("containers", "container-1");
    expect(redis.hset).not.toHaveBeenCalled();
  });

  test("stores container payload for non-removal events", async () => {
    const redis = {
      hdel: jest.fn().mockResolvedValue(1),
      hset: jest.fn().mockResolvedValue(1),
    } as unknown as RedisClient;
    const container = createContainer("container-2");

    await storeContainer(redis, "container.start", container);

    expect(redis.hset).toHaveBeenCalledWith("containers", {
      "container-2": JSON.stringify(container),
    });
    expect(redis.hdel).not.toHaveBeenCalled();
  });
});

describe("storeContainersSnapshot", () => {
  test("replaces cache with snapshot entries", async () => {
    const redis = {
      del: jest.fn().mockResolvedValue(1),
      hset: jest.fn().mockResolvedValue(1),
    } as unknown as RedisClient;
    const first = createContainer("container-1");
    const second = createContainer("container-2");

    await storeContainersSnapshot(redis, [first, second]);

    expect(redis.del).toHaveBeenCalledWith("containers");
    expect(redis.hset).toHaveBeenCalledWith("containers", {
      "container-1": JSON.stringify(first),
      "container-2": JSON.stringify(second),
    });
  });

  test("clears cache and skips hset for empty snapshots", async () => {
    const redis = {
      del: jest.fn().mockResolvedValue(1),
      hset: jest.fn().mockResolvedValue(1),
    } as unknown as RedisClient;

    await storeContainersSnapshot(redis, []);

    expect(redis.del).toHaveBeenCalledWith("containers");
    expect(redis.hset).not.toHaveBeenCalled();
  });
});
