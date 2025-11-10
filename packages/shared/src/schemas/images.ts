import { z } from "zod";

export const imageContainersSchema = z.object({
  running: z.number(),
  paused: z.number(),
  exited: z.number(),
});

export type ImageContainers = z.infer<typeof imageContainersSchema>;

export const imageSchema = z.object({
  id: z.string(),
  repoTags: z.array(z.string()),
  repoDigests: z.array(z.string()),
  created: z.number(),
  size: z.number(),
  sharedSize: z.number(),
  virtualSize: z.number(),
  containers: imageContainersSchema,
});

export type Image = z.infer<typeof imageSchema>;
