"use server";

import {
  type Image,
  imageSchema,
  type PullImageInput,
  pullImageSchema,
  type ServiceResponse,
} from "@containers/shared";
import z from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";

export async function listImages(): Promise<
  ServiceResponse<Array<Image>, string>
> {
  const { data, error } = await $api("/images", {
    method: "get",
    output: z.array(imageSchema),
    next: {
      tags: ["images"],
    },
  });

  if (error) {
    logger.error(error);
    return { data: null, error: "Unexpected error while fetching images." };
  }

  return { data, error: null };
}

export async function pullImage(
  input: PullImageInput
): Promise<ServiceResponse<Image, string>> {
  const result = z.safeParse(pullImageSchema, input);
  if (!result.success) {
    return { data: null, error: "validation error" };
  }

  const { data, error } = await $api("/images", {
    method: "post",
    output: imageSchema,
    body: JSON.stringify(result.data),
    headers: {
      "content-type": "application/json",
    },
  });
  if (error) {
    logger.error({ input, error }, "error while pulling image");
    if (error.status === 404) {
      return { data: null, error: "Image not found." };
    }

    if (error.status === 500) {
      return { data: null, error: "Unexpected error while downloading image." };
    }

    return { data: null, error: error.message || error.statusText };
  }

  return { data, error: null };
}
