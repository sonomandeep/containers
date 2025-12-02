"use server";

import type { EnvVar, PortMapping } from "@/lib/schema/containers";
import { logger } from "@/lib/logger";
import {
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

export async function launchContainerAction(input: {
  name: string;
  image: string;
  restartPolicy: string;
  command?: string;
  cpu?: string;
  memory?: string;
  network?: string;
  envs: Array<EnvVar>;
  ports: Array<PortMapping>;
}) {
  logger.info({ input }, "launchContainerPayload");

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  return {
    data: input,
    error: null,
  };
}
