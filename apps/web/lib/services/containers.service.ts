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

const containerIdSchema = z
  .string()
  .min(1, { message: "Container id is required." });

export const removeContainerInputSchema = z.object({
  containerId: containerIdSchema,
});

export type RemoveContainerInput = z.infer<typeof removeContainerInputSchema>;

export const stopContainerInputSchema = z.object({
  containerId: containerIdSchema,
});

export type StopContainerInput = z.infer<typeof stopContainerInputSchema>;

export const startContainerInputSchema = z.object({
  containerId: containerIdSchema,
});

export type StartContainerInput = z.infer<typeof startContainerInputSchema>;

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

export async function stopContainer(
  input: StopContainerInput,
): Promise<ServiceResponse<null, { status: number; statusText: string }>> {
  const path = `/containers/${encodeURIComponent(input.containerId)}/stop`;

  const { error } = await $api(path, {
    method: "post",
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  updateTag("containers");

  return { data: null, error: null };
}

export async function startContainer(
  input: StartContainerInput,
): Promise<ServiceResponse<null, { status: number; statusText: string }>> {
  const path = `/containers/${encodeURIComponent(input.containerId)}/start`;

  const { error } = await $api(path, {
    method: "post",
  });

  if (error) {
    logger.error(error);
    return { data: null, error };
  }

  updateTag("containers");

  return { data: null, error: null };
}
