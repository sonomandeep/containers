import { imageSchema } from "@containers/shared";
import { z } from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";

export async function listImages() {
  const { data, error } = await $api("/images", {
    method: "get",
    output: z.array(imageSchema),
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  return { data, error: null };
}

export const pullImageInputSchema = z.object({
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
      { message: "Image name contains invalid characters." },
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

export type PullImageInput = z.infer<typeof pullImageInputSchema>;

export async function pullImage(input: PullImageInput) {
  logger.debug(input);
}
