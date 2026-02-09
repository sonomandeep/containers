"use server";

import {
  type Container,
  containerSchema,
  type EnvironmentVariable,
  envinmentVariableSchema,
  launchContainerSchema,
  type ServiceResponse,
} from "@containers/shared";
import { updateTag } from "next/cache";
import { z } from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";
import { checkAuthentication } from "@/lib/services/auth.service";

const stopContainerResponseSchema = z.object({
  commandId: z.string(),
  status: z.literal("queued"),
});

export async function listContainers() {
  const { cookies } = await checkAuthentication();

  const { data, error } = await $api("/containers", {
    method: "get",
    headers: {
      Cookie: cookies.toString(),
    },
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

export async function launchContainer(
  input: unknown
): Promise<ServiceResponse<null, string>> {
  const { cookies } = await checkAuthentication();

  const validation = launchContainerSchema.safeParse(input);
  if (!validation.success) {
    logger.error(validation, "launchContainer - validation error");
    return { data: null, error: "validation error" };
  }

  const { error } = await $api("/containers", {
    method: "post",
    body: JSON.stringify({
      name: validation.data.name,
      image: validation.data.image,
      restartPolicy: validation.data.restartPolicy,
      command: validation.data.command,
      cpu: validation.data.cpu,
      memory: validation.data.memory,
      network: validation.data.network,
      envs: validation.data.envs || [],
      ports: validation.data.ports || [],
    }),
    headers: {
      Cookie: cookies.toString(),
      "content-type": "application/json",
    },
  });

  if (error) {
    logger.error(error, "launchContainer - api error");
    return {
      data: null,
      error: "Unexpected error while starting the container.",
    };
  }

  updateTag("/containers");

  return {
    data: null,
    error: null,
  };
}

export async function startContainer(
  id: string
): Promise<ServiceResponse<Container, string>> {
  const { cookies } = await checkAuthentication();
  const path = `/containers/${encodeURIComponent(id)}/start`;

  const { data, error } = await $api(path, {
    method: "post",
    headers: {
      Cookie: cookies.toString(),
    },
    output: containerSchema,
  });
  if (error) {
    logger.error(error, "startContainer error");
    return {
      data: null,
      error: "Unexpected error while starting the container.",
    };
  }

  return { data, error: null };
}

export async function restartContainer(
  id: string
): Promise<ServiceResponse<Container, string>> {
  const { cookies } = await checkAuthentication();
  const path = `/containers/${encodeURIComponent(id)}/restart`;

  const { data, error } = await $api(path, {
    method: "post",
    headers: {
      Cookie: cookies.toString(),
    },
    output: containerSchema,
  });
  if (error) {
    logger.error(error, "restartContainer error");
    return {
      data: null,
      error: "Unexpected error while restarting the container.",
    };
  }

  return { data, error: null };
}

export async function stopContainer(
  id: string
): Promise<
  ServiceResponse<z.infer<typeof stopContainerResponseSchema>, string>
> {
  const { cookies } = await checkAuthentication();
  const path = `/containers/${encodeURIComponent(id)}/stop`;

  const { data, error } = await $api(path, {
    method: "post",
    headers: {
      Cookie: cookies.toString(),
    },
    output: stopContainerResponseSchema,
  });
  if (error) {
    logger.error(error, "stopContainer error");
    return {
      data: null,
      error: "Unexpected error while queueing the stop command.",
    };
  }

  return { data, error: null };
}

export async function deleteContainer(
  id: string
): Promise<ServiceResponse<{ id: string }, string>> {
  const { cookies } = await checkAuthentication();
  const path = `/containers/${encodeURIComponent(id)}`;

  const { error } = await $api(path, {
    method: "delete",
    headers: {
      Cookie: cookies.toString(),
    },
  });
  if (error) {
    logger.error(error, "deleteContainer error");
    return {
      data: null,
      error: "Unexpected error while deleting the container.",
    };
  }

  return { data: { id }, error: null };
}

export async function updateEnvVariables(
  id: string,
  envs: Array<EnvironmentVariable>
) {
  const path = `/containers/${encodeURIComponent(id)}/envs`;

  const { data, error } = await $api(path, {
    method: "post",
    body: JSON.stringify(envs),
    output: z.array(envinmentVariableSchema),
    headers: {
      "content-type": "application/json",
    },
  });
  if (error) {
    logger.error(error, "updateEnvVariables error");
    return {
      data: null,
      error: "Unexpected error while updating env variables.",
    };
  }

  return { data: { id, envs: data }, error: null };
}
