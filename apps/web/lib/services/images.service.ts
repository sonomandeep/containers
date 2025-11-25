import type { Image, ServiceResponse } from "@containers/shared";
import { imageSchema } from "@containers/shared";
import { updateTag } from "next/cache";
import { z } from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";

export async function listImages() {
  const { data, error } = await $api("/images", {
    method: "get",
    output: z.array(imageSchema),
    next: {
      tags: ["images"],
    },
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

export const removeImagesInputSchema = z.object({
  ids: z
    .array(
      z
        .string()
        .min(1, { message: "Image id is required." })
        .max(128, { message: "Image id is too long." }),
    )
    .min(1, { message: "Please select at least one image to remove." }),
});

export type RemoveImagesInput = z.infer<typeof removeImagesInputSchema>;

export async function pullImage(
  input: PullImageInput,
): Promise<ServiceResponse<Image, { status: number; statusText: string }>> {
  const { data, error } = await $api("/images", {
    method: "post",
    body: JSON.stringify({
      registry: input.registry,
      name: input.name,
      tag: input.tag,
    }),
    headers: {
      "content-type": "application/json",
    },
    output: imageSchema,
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  updateTag("images");

  return { data, error: null };
}
