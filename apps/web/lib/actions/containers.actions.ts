"use server";

import { logger } from "@/lib/logger";
import {
  removeContainer,
} from "@/lib/services/containers.service";

export async function removeContainerAction(
  containerId: string,
) {
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
  logger.debug({ containerId });

  return { data: { containerId }, error: null };
}
