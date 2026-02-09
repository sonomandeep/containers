import { z } from "zod";

export const stopCommandPayloadSchema = z.object({
  containerId: z.string().min(1),
});

type CommandPayloadSchemas = {
  "container.stop": typeof stopCommandPayloadSchema;
};

type CommandName = keyof CommandPayloadSchemas;

type CommandPayload<TName extends CommandName> = z.infer<
  CommandPayloadSchemas[TName]
>;

const commandPayloadSchemas: CommandPayloadSchemas = {
  "container.stop": stopCommandPayloadSchema,
};

const commandNameSchema = z.enum(["container.stop"]);

const commandDataSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("container.stop"),
    payload: stopCommandPayloadSchema,
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

type BuildCommandInput<TName extends CommandName> = {
  name: TName;
  payload: CommandPayload<TName>;
  id?: string;
  ts?: string;
};

export function buildCommand<TName extends CommandName>(
  input: BuildCommandInput<TName>
): AgentCommand {
  const payloadSchema = commandPayloadSchemas[input.name];
  const payload = payloadSchema.parse(input.payload);

  return commandSchema.parse({
    type: "command",
    ts: input.ts ?? new Date().toISOString(),
    data: {
      id: input.id ?? crypto.randomUUID(),
      name: commandNameSchema.parse(input.name),
      payload,
    },
  });
}
