import { afterEach, describe, expect, jest, mock, spyOn, test } from "bun:test";
import type Dockerode from "dockerode";
import * as HttpStatusCodes from "stoker/http-status-codes";

type FakeDocker = {
  getContainer: (id: string) => Dockerode.Container;
};

const fakeDocker: FakeDocker = {
  getContainer: (_id: string): Dockerode.Container => {
    throw new Error("getContainer not mocked");
  },
};

mock.module("@/lib/agent", () => ({ docker: fakeDocker }));

const service = await import("@/lib/services/terminal.service");

afterEach(() => {
  jest.restoreAllMocks();
});

describe("validateTerminalAccess", () => {
  test("returns access details when container is running", async () => {
    const container = {
      inspect: () => ({
        Id: "container-1",
        Name: "/api",
        State: { Running: true },
      }),
    } as unknown as Dockerode.Container;

    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.validateTerminalAccess("container-1");

    expect(result).toEqual({
      data: { id: "container-1", name: "api" },
      error: null,
    });
  });

  test("returns conflict when container is not running", async () => {
    const container = {
      inspect: () => ({
        Id: "container-2",
        Name: "/worker",
        State: { Running: false },
      }),
    } as unknown as Dockerode.Container;

    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.validateTerminalAccess("container-2");

    expect(result).toEqual({
      data: null,
      error: {
        message: "Container is not running",
        code: HttpStatusCodes.CONFLICT,
      },
    });
  });

  test("returns not found when docker reports missing container", async () => {
    const container = {
      inspect: () => {
        const error = new Error("Not Found");
        return Object.assign(error, {
          statusCode: HttpStatusCodes.NOT_FOUND,
        });
      },
    } as unknown as Dockerode.Container;

    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.validateTerminalAccess("missing");

    expect(result).toEqual({
      data: null,
      error: {
        message: "Container not found",
        code: HttpStatusCodes.NOT_FOUND,
      },
    });
  });

  test("returns internal error on unexpected failures", async () => {
    const container = {
      inspect: () => {
        throw new Error("boom");
      },
    } as unknown as Dockerode.Container;

    spyOn(fakeDocker, "getContainer").mockReturnValue(container);

    const result = await service.validateTerminalAccess("container-3");

    expect(result).toEqual({
      data: null,
      error: {
        message: "Internal server error",
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    });
  });
});

describe("parseEvent", () => {
  test("parses input event from string", async () => {
    const payload = JSON.stringify({ type: "input", message: "ls\n" });
    const result = await service.parseEvent(payload);

    expect(result).toEqual({
      data: { type: "input", message: "ls\n" },
      error: null,
    });
  });

  test("parses resize event from ArrayBuffer", async () => {
    const payload = JSON.stringify({ type: "resize", cols: 80, rows: 24 });
    const buffer = new TextEncoder().encode(payload).buffer;
    const result = await service.parseEvent(buffer);

    expect(result).toEqual({
      data: { type: "resize", cols: 80, rows: 24 },
      error: null,
    });
  });

  test("parses event from Blob", async () => {
    const payload = JSON.stringify({ type: "input", message: "pwd\n" });
    const blob = new Blob([payload]);
    const result = await service.parseEvent(blob);

    expect(result).toEqual({
      data: { type: "input", message: "pwd\n" },
      error: null,
    });
  });

  test("returns invalid json error for malformed payload", async () => {
    const result = await service.parseEvent("{");

    expect(result).toEqual({
      data: null,
      error: "invalid json",
    });
  });

  test("returns validation error for invalid schema", async () => {
    const payload = JSON.stringify({ type: "resize", cols: "x", rows: 1 });
    const result = await service.parseEvent(payload);

    expect(result).toEqual({
      data: null,
      error: "validation error",
    });
  });

  test("returns unsupported input type for unknown payloads", async () => {
    const payload = new Uint8Array([1, 2, 3]);
    const result = await service.parseEvent(payload as unknown as ArrayBuffer);

    expect(result).toEqual({
      data: null,
      error: "unsupported input type",
    });
  });
});
