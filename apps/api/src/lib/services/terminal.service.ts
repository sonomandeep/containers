import { spawn, Terminal } from "bun";
import type { WSMessageReceive } from "hono/ws";
import z from "zod";

export function startTerminal(
  container: string,
  onData: (terminal: Terminal, data: Uint8Array<ArrayBuffer>) => void
) {
  try {
    const proc = spawn(["docker", "exec", "-it", container, "bash"], {
      terminal: {
        cols: 71,
        rows: 24,
        data: onData,
      },
    });

    if (!proc?.terminal) {
      return { data: null, error: { message: "error opening terminal" } };
    }

    return { data: proc.terminal, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

const eventSchema = z.object({
  type: z.literal("input"),
  message: z.string(),
});

export async function parseEvent(input: WSMessageReceive) {
  let event: unknown = null;

  if (typeof input === "string") {
    event = JSON.parse(input);
  }

  if (input instanceof Blob) {
    event = JSON.parse(await input.text());
  }

  if (input instanceof ArrayBuffer) {
    event = new TextDecoder().decode(input);
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
