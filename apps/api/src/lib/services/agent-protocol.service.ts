import type { ServiceResponse } from "@containers/shared";
import { containerSchema, imageSchema } from "@containers/shared";
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

const baseEventSchema = z.object({
  type: z.string().min(1),
  ts: z.string().min(1),
  data: z.unknown(),
});

const containerEventSchema = baseEventSchema.extend({
  type: z.string().refine((value) => value.startsWith("container."), {
    message: "expected container event type",
  }),
  data: containerSchema,
});

const imageEventSchema = baseEventSchema.extend({
  type: z.string().refine((value) => value.startsWith("image."), {
    message: "expected image event type",
  }),
  data: imageSchema,
});

const snapshotPayloadSchema = z.object({
  containers: z.array(containerSchema),
  images: z.array(imageSchema),
});

const snapshotEventSchema = baseEventSchema.extend({
  type: z.literal("snapshot"),
  data: snapshotPayloadSchema,
});

const agentEventSchema = z.union([
  containerEventSchema,
  imageEventSchema,
  snapshotEventSchema,
]);

export type AgentEvent = z.infer<typeof agentEventSchema>;
export type ContainerEvent = z.infer<typeof containerEventSchema>;
export type SnapshotEvent = z.infer<typeof snapshotEventSchema>;

export function parseAgentMessage(data: unknown): AgentEvent {
  if (typeof data !== "string") {
    throw new Error("unsupported message type");
  }

  const payload = JSON.parse(data) as unknown;
  return agentEventSchema.parse(payload);
}

export function isContainerEvent(event: AgentEvent): event is ContainerEvent {
  return event.type.startsWith("container.");
}

export function isSnapshotEvent(event: AgentEvent): event is SnapshotEvent {
  return event.type === "snapshot";
}
