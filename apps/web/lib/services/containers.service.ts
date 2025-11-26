import { containerSchema } from "@containers/shared";
import { z } from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";

export async function listContainers() {
  const { data, error } = await $api("/containers", {
    method: "get",
    output: z.array(containerSchema),
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  return { data, error: null };
}

export const removeContainerInputSchema = z.object({
  containerId: z
    .string()
    .nonempty(),
});

export type RemoveContainerInput = z.infer<typeof removeContainerInputSchema>;

export async function removeContainer(input: RemoveContainerInput) {
  logger.info(
    { containerId: input.containerId },
    "Mock remove container action triggered.",
  );

  return { data: null, error: null };
}
