import { z } from "zod";

const AGENT_NAME_MAX_LENGTH = 100;

const agentNameSchema = z
  .string()
  .trim()
  .min(1, "Agent name is required")
  .max(
    AGENT_NAME_MAX_LENGTH,
    `Agent name must not exceed ${AGENT_NAME_MAX_LENGTH} characters`
  );

export const agentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: agentNameSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createAgentSchema = z.object({
  name: agentNameSchema,
});

export const updateAgentSchema = z.object({
  name: agentNameSchema,
});

export type Agent = z.infer<typeof agentSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
