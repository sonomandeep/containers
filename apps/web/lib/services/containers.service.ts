import type { ServiceResponse } from "@containers/shared";
import { containerSchema } from "@containers/shared";
import { updateTag } from "next/cache";
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

export const removeContainerInputSchema = z.object({
  containerId: z.string().min(1, { message: "Container id is required." }),
});

export type RemoveContainerInput = z.infer<typeof removeContainerInputSchema>;

export async function removeContainer(
  input: RemoveContainerInput,
): Promise<ServiceResponse<null, { status: number; statusText: string }>> {
  const path = `/containers/${encodeURIComponent(input.containerId)}`;

  const { error } = await $api(path, {
    method: "delete",
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  updateTag("containers");

  return { data: null, error: null };
}
