import { z } from "zod";

export const containerStateSchema = z.enum(["running", "paused", "exited"]);

export type ContainerState = z.infer<typeof containerStateSchema>;

export const containerPortSchema = z.object({
  ip: z.string(),
  privatePort: z.number(),
  publicPort: z.number(),
  type: z.string(),
});

export type ContainerPort = z.infer<typeof containerPortSchema>;

export const containerMetricsSchema = z.object({
  cpuPercent: z.number().optional().nullable(),
  memoryUsage: z.number().optional().nullable(),
  memoryLimit: z.number().optional().nullable(),
  networkRx: z.number().optional().nullable(),
  networkTx: z.number().optional().nullable(),
});

export type ContainerMetrics = z.infer<typeof containerMetricsSchema>;

export const containerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: containerStateSchema,
  ports: z.array(containerPortSchema),
  created: z.number(),
  metrics: containerMetricsSchema.optional(),
});

export type Container = z.infer<typeof containerSchema>;
