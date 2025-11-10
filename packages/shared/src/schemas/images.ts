import { z } from "zod";

export const imageSchema = z.object({
  id: z.string(),
  repoTags: z.array(z.string()),
  repoDigests: z.array(z.string()),
  created: z.number(),
  size: z.number(),
  sharedSize: z.number(),
  virtualSize: z.number(),
  containers: z.number(),
});

export type Image = z.infer<typeof imageSchema>;
