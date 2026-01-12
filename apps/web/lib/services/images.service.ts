"use server";

import {
  type Image,
  imageSchema,
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
