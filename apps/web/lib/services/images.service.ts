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
import { checkAuthentication } from "./auth.service";

export async function listImages(): Promise<
  ServiceResponse<Array<Image>, string>
> {
  const { cookies } = await checkAuthentication();

  const { data, error } = await $api("/images", {
    method: "get",
    headers: {
      Cookie: cookies.toString(),
    },
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
  const { cookies } = await checkAuthentication();

  const result = z.safeParse(pullImageSchema, input);
  if (!result.success) {
    return { data: null, error: "validation error" };
  }

  const { data, error } = await $api("/images", {
    method: "post",
    headers: {
      "content-type": "application/json",
      Cookie: cookies.toString(),
    },
    output: imageSchema,
    body: JSON.stringify(result.data),
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

export async function removeImages(
  input: Array<Image["id"]>
): Promise<ServiceResponse<Array<Image["id"]>, string>> {
  const { cookies } = await checkAuthentication();

  const { error } = await $api("/images/remove", {
    method: "post",
    body: JSON.stringify({ images: input }),
    headers: {
      Cookie: cookies.toString(),
      "content-type": "application/json",
    },
  });
  if (error) {
    logger.error(error, "removeImages error");
    return {
      data: null,
      error: "Unexpected error while removing images.",
    };
  }

  return { data: input, error: null };
}
