import { z } from "zod";

export const containerStateSchema = z.enum(["running", "paused", "exited"]);

export type ContainerState = z.infer<typeof containerStateSchema>;

export const containerPortSchema = z.object(
  {
    ip: z.string(),
    privatePort: z.number(),
    publicPort: z.number(),
    type: z.string(),
  },
);

export type ContainerPort = z.infer<typeof containerPortSchema>;

export const containerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: containerStateSchema,
  ports: z.array(containerPortSchema),
  created: z.number(),
});

export type Container = z.infer<typeof containerSchema>;
