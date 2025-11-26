import type { ServiceResponse } from "@containers/shared";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";
import { isDockerodeError } from "@/lib/utils";

interface RemoveContainerInput {
  containerId: string;
  force?: boolean;
}

type RemoveContainerError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

export async function removeContainer(
  input: RemoveContainerInput,
): Promise<ServiceResponse<null, RemoveContainerError>> {
  try {
    const container = docker.getContainer(input.containerId);
    await container.remove(input.force ? { force: true } : undefined);

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    if (isDockerodeError(error)) {
      if (error.statusCode === HttpStatusCodes.NOT_FOUND) {
        return {
          data: null,
          error: {
            message: HttpStatusPhrases.NOT_FOUND,
            code: HttpStatusCodes.NOT_FOUND,
          },
        };
      }

      if (error.statusCode === HttpStatusCodes.CONFLICT) {
        return {
          data: null,
          error: {
            message:
              "Cannot delete a running container. Stop it and retry or force the removal.",
            code: HttpStatusCodes.CONFLICT,
          },
        };
      }
    }

    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}
