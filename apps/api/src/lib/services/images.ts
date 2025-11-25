import type { Image, ServiceResponse } from "@containers/shared";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";
import { isDockerodeError } from "../utils";

interface PullImageInput {
  registry: string;
  name: string;
  tag: string;
}

interface RemoveImagesInput {
  images: Array<string>;
}

const IMAGE_IN_USE_MESSAGE = "Cannot delete images with existing containers.";

export async function pullImage(input: PullImageInput): Promise<ServiceResponse<Image, { message: string; code: typeof HttpStatusCodes.NOT_FOUND | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR }>> {
  try {
    const stream = await docker.pull(`${input.registry}/${input.name}:${input.tag}`);
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err)
          reject(err);
        else resolve(res);
      });
    });

    const image = docker.getImage(`${input.name}:${input.tag}`);
    const info = await image.inspect();

    const result: Image = {
      id: info.Id,
      repoTags: info.RepoTags ?? [],
      repoDigests: info.RepoDigests ?? [],
      created: (new Date(info.Created)).valueOf() ?? 0,
      size: info.Size ?? 0,
      virtualSize: info.VirtualSize ?? 0,
    };

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    if (isDockerodeError(error)) {
      if (error.statusCode === 404) {
        return {
          data: null,
          error: {
            message: HttpStatusPhrases.NOT_FOUND,
            code: HttpStatusCodes.NOT_FOUND,
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

export async function removeImages(input: RemoveImagesInput): Promise<ServiceResponse<null, { message: string; code: typeof HttpStatusCodes.INTERNAL_SERVER_ERROR | typeof HttpStatusCodes.CONFLICT }>> {
  try {
    for (const imageId of input.images) {
      const image = docker.getImage(imageId);
      await image.remove();
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    if (isDockerodeError(error) && error.statusCode === HttpStatusCodes.CONFLICT) {
      return {
        data: null,
        error: {
          message: IMAGE_IN_USE_MESSAGE,
          code: HttpStatusCodes.CONFLICT,
        },
      };
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
