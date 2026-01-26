import { spawn, type Subprocess, type Terminal } from "bun";
import * as HttpStatusCodes from "stoker/http-status-codes";
import type { WSMessageReceive } from "hono/ws";
import z from "zod";
import { docker } from "@/lib/agent";
import { isDockerodeError } from "@/lib/utils";

type TerminalSession = {
  terminal: Terminal;
  process: Subprocess;
};

type TerminalAccess = {
  id: string;
  name: string;
};

type TerminalAccessError = {
  message: string;
  code: number;
};

export function startTerminal(
  container: string,
  cols: number,
  rows: number,
  onData: (terminal: Terminal, data: Uint8Array<ArrayBuffer>) => void
) {
  try {
    const proc = spawn(
      ["docker", "exec", "-it", container, "sh", "-lc", "exec bash || exec sh"],
      {
        terminal: {
          cols,
          rows,
          data: onData,
        },
      }
    );

    if (!proc?.terminal) {
      return { data: null, error: { message: "error opening terminal" } };
    }

    return {
      data: { terminal: proc.terminal, process: proc } satisfies TerminalSession,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function validateTerminalAccess(containerId: string) {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();

    if (!info.State.Running) {
      return {
        data: null,
        error: {
          message: "Container is not running",
          code: HttpStatusCodes.CONFLICT,
        } satisfies TerminalAccessError,
      };
    }

    return {
      data: {
        id: info.Id,
        name: info.Name?.replace("/", "") || "-",
      } satisfies TerminalAccess,
      error: null,
    };
  } catch (error) {
    if (isDockerodeError(error)) {
      if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
        return {
          data: null,
          error: {
            message: "Container not found",
            code: HttpStatusCodes.NOT_FOUND,
          } satisfies TerminalAccessError,
        };
      }
    }

    return {
      data: null,
      error: {
        message: "Internal server error",
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      } satisfies TerminalAccessError,
    };
  }
}

const eventSchema = z.object({
  type: z.literal("input"),
  message: z.string(),
});

export async function parseEvent(input: WSMessageReceive) {
  let payload: string | null = null;

  if (typeof input === "string") {
    payload = input;
  }

  if (input instanceof Blob) {
    payload = await input.text();
  }

  if (input instanceof ArrayBuffer) {
    payload = new TextDecoder().decode(input);
  }

  if (payload === null) {
    return { data: null, error: "unsupported input type" };
  }

  let event: unknown;
  try {
    event = JSON.parse(payload);
  } catch {
    return { data: null, error: "invalid json" };
  }

  const validation = eventSchema.safeParse(event);

  if (!validation.success) {
    return {
      data: null,
      error: "validation error",
    };
  }

  return { data: validation.data, error: null };
}
