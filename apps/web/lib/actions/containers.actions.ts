"use server";

import type { LaunchContainerInput } from "@containers/shared";
import { logger } from "@/lib/logger";
import {
  launchContainer,
  removeContainer,
  startContainer,
  stopContainer,
} from "@/lib/services/containers.service";

export async function removeContainerAction(containerId: string) {
  const { error } = await removeContainer({ containerId });

  if (error) {
    logger.error(error, "removeContainerAction");

    return {
      data: {
        containerId,
      },
      error: "Unexpected error while deleting the container.",
    };
  }

  return { data: { containerId }, error: null };
}

export async function stopContainerAction(containerId: string) {
  const { error } = await stopContainer({ containerId });

  if (error) {
    logger.error(error, "stopContainerAction");

    return {
      data: {
        containerId,
      },
      error: "Unexpected error while stopping the container.",
    };
  }

  return { data: { containerId }, error: null };
}

export async function startContainerAction(containerId: string) {
  const { error } = await startContainer({ containerId });

  if (error) {
    logger.error(error, "startContainerAction");

    return {
      data: {
        containerId,
      },
      error: "Unexpected error while starting the container.",
    };
  }

  return { data: { containerId }, error: null };
}

export async function launchContainerAction(input: LaunchContainerInput) {
  logger.debug({ input }, "launchContainerPayload");

  const { data, error } = await launchContainer(input);

  if (error) {
    logger.error(error, "launchContainerAction");

    let message: string;
    switch (error.status) {
      case 404:
        message = "Image not found.";
        break;
      case 409:
        message = "A container with the same name already exists.";
        break;
      default:
        message = "Unexpected error while launching the container.";
        break;
    }

    return {
      data: input,
      error: message,
    };
  }

  return {
    data: {
      ...input,
      id: data?.id,
    },
    error: null,
  };
}
