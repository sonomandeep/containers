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
