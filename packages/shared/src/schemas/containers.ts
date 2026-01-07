import { z } from "zod";

export const containerStateSchema = z.enum([
  "running",
  "paused",
  "exited",
  "restarting",
  "created",
]);

export type ContainerState = z.infer<typeof containerStateSchema>;

export const containerMetricsSchema = z.object({
  cpu: z.string(),
  memory: z.object({
    usage: z.string(),
    limit: z.string(),
    percent: z.string(),
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

export const containerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: containerStateSchema,
  status: z.string(),
  ports: z.array(containerPortSchema),
  metrics: containerMetricsSchema.optional(),
  created: z.number(),
});

export type Container = z.infer<typeof containerSchema>;
