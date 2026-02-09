import type { ServiceResponse } from "@containers/shared";
import { z } from "zod";

const commandDataSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("container.stop"),
    payload: z.object({
      containerId: z.string().min(1),
    }),
  }),
]);

export const commandSchema = z.object({
  type: z.literal("command"),
  ts: z.iso.datetime(),
  data: z
    .object({
      id: z.uuid(),
    })
    .and(commandDataSchema),
});

export type AgentCommand = z.infer<typeof commandSchema>;

type BuildCommandInput = z.input<typeof commandDataSchema> & {
  id?: string;
  ts?: string;
};

type BuildCommandError = "invalid command payload";

export function buildCommand(
  input: BuildCommandInput
): ServiceResponse<AgentCommand, BuildCommandError> {
  const { id, ts, ...data } = input;

  const validation = commandSchema.safeParse({
    type: "command",
    ts: ts ?? new Date().toISOString(),
    data: {
      id: id ?? crypto.randomUUID(),
      ...data,
    },
  });

  if (!validation.success) {
    return {
      data: null,
      error: "invalid command payload",
    };
  }

  return {
    data: validation.data,
    error: null,
  };
}
