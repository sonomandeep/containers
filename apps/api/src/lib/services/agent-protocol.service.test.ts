import { describe, expect, test } from "bun:test";

const protocol = await import("@/lib/services/agent-protocol.service");

describe("buildCommand", () => {
  test("builds a valid stop command", () => {
    const result = protocol.buildCommand({
      name: "container.stop",
      payload: {
        containerId: "container-1",
      },
      id: "11111111-1111-4111-8111-111111111111",
      ts: "2026-01-01T00:00:00.000Z",
    });

    expect(result).toEqual({
      data: {
        type: "command",
        ts: "2026-01-01T00:00:00.000Z",
        data: {
          id: "11111111-1111-4111-8111-111111111111",
          name: "container.stop",
          payload: {
            containerId: "container-1",
          },
        },
      },
      error: null,
    });
  });

  test("returns error when stop payload is invalid", () => {
    const result = protocol.buildCommand({
      name: "container.stop",
      payload: {
        containerId: "",
      },
    });

    expect(result).toEqual({
      data: null,
      error: "invalid command payload",
    });
  });
});
