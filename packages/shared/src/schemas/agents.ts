import { z } from "zod";

export const agentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  client: z.unknown(),
});

export type Agent<T> = Omit<z.infer<typeof agentSchema>, "client"> & {
  client: T;
};
