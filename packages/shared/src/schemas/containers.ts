import { z } from "zod";

export const containerStateSchema = z.enum([
  "running",
  "paused",
  "exited",
  "restarting",
  "created",
]);

export type ContainerState = z.infer<typeof containerStateSchema>;
export const ContainerStateEnum = containerStateSchema.enum;

export const containerMetricsSchema = z.object({
  cpu: z.number(),
  memory: z.object({
    used: z.number(),
    total: z.number(),
  }),
});

export type ContainerMetrics = z.infer<typeof containerMetricsSchema>;

export const containerPortSchema = z.object({
  ipVersion: z.string(),
  private: z.number(),
  public: z.number().optional(),
  type: z.string(),
});

export type ContainerPort = z.infer<typeof containerPortSchema>;

export const envinmentVariableSchema = z.object({
  key: z.string().min(1).nonempty(),
  value: z.string().min(1).nonempty(),
});

export type EnvironmentVariable = z.infer<typeof envinmentVariableSchema>;

export const containerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: containerStateSchema,
  status: z.string(),
  ports: z.array(containerPortSchema),
  metrics: containerMetricsSchema.optional(),
  envs: z.array(envinmentVariableSchema),
  host: z.string().optional(),
  created: z.number(),
});

export type Container = z.infer<typeof containerSchema>;
