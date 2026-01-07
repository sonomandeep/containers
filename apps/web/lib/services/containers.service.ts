"use server";

import { containerSchema } from "@containers/shared";
import { z } from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";

export async function listContainers() {
  const { data, error } = await $api("/containers", {
    method: "get",
    output: z.array(containerSchema),
    next: {
      tags: ["containers"],
    },
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function stopContainer(id: string) {
  const path = `/containers/${encodeURIComponent(id)}/stop`;

  const { error } = await $api(path, {
    method: "post",
  });
  if (error) {
    logger.error(error);
    return {
      error: "Unexpected error while stopping the container.",
    };
  }

  return { error: null };
}
