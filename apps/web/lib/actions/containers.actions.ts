"use server";

import { logger } from "@/lib/logger";
import {
  removeContainer,
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
