import { spawn, Terminal } from "bun";
import type { WSMessageReceive } from "hono/ws";
import z from "zod";

export function startTerminal(
  onData: (terminal: Terminal, data: Uint8Array<ArrayBuffer>) => void
) {
  try {
    const proc = spawn(["bash"], {
      terminal: {
        cols: 80,
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

export function parseEvent(input: WSMessageReceive) {
  let str: string;

  if (input === "string") {
    str = input;
  }

  if (input === ArrayBufferLike) {
    str = new TextDecoder().decode(input);
  }

  return { data: {}, error: null };
}
