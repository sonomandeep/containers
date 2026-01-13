import { z } from "zod";
import { containerStateSchema } from "./containers";

export const imageContainerSchema = z.object({
  id: z.string(),
  name: z.string(),
  state: containerStateSchema,
});

export type ImageContainer = z.infer<typeof imageContainerSchema>;

export const imageSchema = z.object({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()),
  size: z.number(),
  layers: z.number().optional(),
  os: z.string(),
  architecture: z.string(),
  registry: z.string(),
  containers: z.array(imageContainerSchema),
});

export type Image = z.infer<typeof imageSchema>;
