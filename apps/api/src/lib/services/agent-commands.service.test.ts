import { describe, expect, test } from "bun:test";

const commands = await import("@/lib/services/agent-commands.service");

describe("buildCommand", () => {
  test("builds a valid stop command", () => {
    const command = commands.buildCommand({
      name: "container.stop",
      payload: {
        containerId: "container-1",
      },
      id: "11111111-1111-4111-8111-111111111111",
      ts: "2026-01-01T00:00:00.000Z",
    });

    expect(command).toEqual({
      type: "command",
      ts: "2026-01-01T00:00:00.000Z",
      data: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "container.stop",
        payload: {
          containerId: "container-1",
        },
      },
    });
  });

  test("throws when stop payload is invalid", () => {
    expect(() => {
      commands.buildCommand({
        name: "container.stop",
        payload: {
          containerId: "",
        },
      });
    }).toThrow();
  });
});
