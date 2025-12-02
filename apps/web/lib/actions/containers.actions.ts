"use server";

import { logger } from "@/lib/logger";
import {
  launchContainer,
  removeContainer,
  startContainer,
  stopContainer,
} from "@/lib/services/containers.service";
import type { LaunchContainerInput } from "@/lib/services/containers.service";

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
  logger.info({ input }, "launchContainerPayload");

  const { error } = await launchContainer(input);

  if (error) {
    logger.error(error, "launchContainerAction");

    return {
      data: input,
      error: "Unexpected error while launching the container.",
    };
  }

  return {
    data: input,
    error: null,
  };
}
