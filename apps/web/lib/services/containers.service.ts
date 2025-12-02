import type { ServiceResponse } from "@containers/shared";
import type { EnvVar, PortMapping } from "@/lib/schema/containers";
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

const envVarSchema = z.object({
  key: z
    .string({ message: "Env key must be a string." })
    .trim()
    .min(1, { message: "Env key is required." }),
  value: z
    .string({ message: "Env value must be a string." })
    .trim()
    .min(1, { message: "Env value is required." }),
});

const portMappingSchema = z.object({
  hostPort: z
    .string({ message: "Host port must be a string." })
    .trim()
    .min(1, { message: "Host port is required." }),
  containerPort: z
    .string({ message: "Container port must be a string." })
    .trim()
    .min(1, { message: "Container port is required." }),
});

export const launchContainerInputSchema = z.object({
  name: z
    .string({ message: "Name must be a string." })
    .trim()
    .min(1, { message: "Container name is required." }),
  image: z
    .string({ message: "Image must be a string." })
    .trim()
    .min(1, { message: "Image is required." }),
  restartPolicy: z
    .string({ message: "Restart policy must be a string." })
    .trim()
    .min(1, { message: "Restart policy is required." }),
  command: z.string().trim().optional(),
  cpu: z.string().trim().optional(),
  memory: z.string().trim().optional(),
  network: z.string().trim().optional(),
  envs: z
    .array(envVarSchema)
    .optional()
    .default([] satisfies Array<EnvVar>),
  ports: z
    .array(portMappingSchema)
    .optional()
    .default([] satisfies Array<PortMapping>),
});

export type LaunchContainerInput = z.infer<typeof launchContainerInputSchema>;

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

export async function launchContainer(
  input: LaunchContainerInput,
): Promise<ServiceResponse<null, { status: number; statusText: string }>> {
  logger.info({ input }, "launchContainerServicePayload");

  updateTag("containers");

  return { data: null, error: null };
}
