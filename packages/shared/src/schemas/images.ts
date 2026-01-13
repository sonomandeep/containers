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

export const pullImageSchema = z.object({
  registry: z
    .string()
    .min(1, { message: "Please select a registry." })
    .max(255, { message: "Selected registry value is too long." }),
  name: z
    .string()
    .min(1, { message: "Please enter the image name." })
    .max(128, { message: "Image name is too long." })
    .regex(
      /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*$/,
      { message: "Image name contains invalid characters." }
    ),
  tag: z
    .string()
    .min(1, { message: "Please enter a tag." })
    .max(128, { message: "Tag is too long." })
    .regex(/^[\w.-]+$/, {
      message:
        "Tag can only include letters, numbers, dots, dashes, and underscores.",
    }),
});
export type PullImageInput = z.infer<typeof pullImageSchema>;
