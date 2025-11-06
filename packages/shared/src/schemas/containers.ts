import { z } from "zod";

export const containerSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  state: z.enum(["running", "paused", "exited"]),
  ports: z.string().optional(),
  created: z.number(),
});

export type Container = z.infer<typeof containerSchema>;
