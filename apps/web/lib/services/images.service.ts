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

const formBooleanSchema = z
  .union([
    z.literal("true"),
    z.literal("false"),
    z.literal("on"),
    z.boolean(),
  ])
  .optional()
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      return value === "true" || value === "on";
    }

    return false;
  });

const imageIdSchema = z
  .string()
  .min(1, { message: "Image id is required." })
  .max(128, { message: "Image id is too long." });

export const removeImagesInputSchema = z.object({
  images: z
    .preprocess((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return [value];
      }

      return value;
    }, z.array(imageIdSchema).min(1, { message: "Please select at least one image to remove." })),
  force: formBooleanSchema,
});

export type RemoveImagesInput = z.infer<typeof removeImagesInputSchema>;

export async function removeImages(input: RemoveImagesInput): Promise<ServiceResponse<null, { status: number; statusText: string }>> {
  const { error } = await $api("/images/remove", {
    method: "post",
    body: JSON.stringify(input),
    headers: {
      "content-type": "application/json",
    },
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  updateTag("images");

  return { data: null, error: null };
}
