"use server";

import {
  type Container,
  containerSchema,
  type ServiceResponse,
} from "@containers/shared";
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

export async function startContainer(
  id: string
): Promise<ServiceResponse<Container, string>> {
  const path = `/containers/${encodeURIComponent(id)}/start`;

  const { data, error } = await $api(path, {
    method: "post",
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
  const path = `/containers/${encodeURIComponent(id)}/restart`;

  const { data, error } = await $api(path, {
    method: "post",
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
): Promise<ServiceResponse<Container, string>> {
  const path = `/containers/${encodeURIComponent(id)}/stop`;

  const { data, error } = await $api(path, {
    method: "post",
    output: containerSchema,
  });
  if (error) {
    logger.error(error, "stopContainer error");
    return {
      data: null,
      error: "Unexpected error while stopping the container.",
    };
  }

  return { data, error: null };
}

export async function deleteContainer(
  id: string
): Promise<ServiceResponse<{ id: string }, string>> {
  const path = `/containers/${encodeURIComponent(id)}`;

  const { error } = await $api(path, {
    method: "delete",
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
