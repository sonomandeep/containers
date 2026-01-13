import type {
  ContainerState,
  Image,
  ServiceResponse,
} from "@containers/shared";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";
import { isDockerodeError } from "../utils";

export async function listImages() {
  const [images, containers] = await Promise.all([
    docker.listImages({ all: true }),
    docker.listContainers({ all: true }),
  ]);

  const result: Array<Image> = [];

  for (const image of images) {
    const imageData = docker.getImage(image.Id);
    const info = await imageData.inspect();

    const relatedContainers = containers.filter(
      (container) => container.ImageID === image.Id
    );

    result.push({
      id: image.Id.replace("sha256:", "").slice(0, 12),
      name: image.RepoTags?.at(0) || "",
      tags: image.RepoTags || [],
      size: image.Size,
      layers: info.RootFS.Layers?.length || undefined,
      os: info.Os,
      architecture: info.Architecture,
      registry: "docker.io",
      containers: relatedContainers.map((container) => ({
        id: container.Id.replace("sha256:", "").slice(0, 12),
        name: container.Names.at(0) || "",
        state: container.State as ContainerState,
      })),
    });
  }

  return result;
}

type PullImageInput = {
  registry: string;
  name: string;
  tag: string;
};

export async function pullImage(input: PullImageInput): Promise<
  ServiceResponse<
    Image,
    {
      message: string;
      code:
        | typeof HttpStatusCodes.NOT_FOUND
        | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
  >
> {
  try {
    const stream = await docker.pull(
      `${input.registry}/${input.name}:${input.tag}`
    );
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });

    const image = docker.getImage(`${input.name}:${input.tag}`);
    const info = await image.inspect();

    const result: Image = {
      id: info.Id,
      repoTags: info.RepoTags ?? [],
      repoDigests: info.RepoDigests ?? [],
      created: new Date(info.Created).valueOf() ?? 0,
      size: info.Size ?? 0,
      virtualSize: info.VirtualSize ?? 0,
    };

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    if (isDockerodeError(error) && error.statusCode === 404) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.NOT_FOUND,
          code: HttpStatusCodes.NOT_FOUND,
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

type RemoveImagesInput = {
  images: Array<string>;
  force?: boolean;
};

async function removeImage(imageId: string, force?: boolean) {
  if (force) {
    const containers = await docker.listContainers({
      all: true,
      filters: {
        ancestor: [imageId],
      },
    });

    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      await container.remove({ force: true });
    }
  }

  const image = docker.getImage(imageId);
  await image.remove(force ? { force: true } : undefined);
}

export async function removeImages(input: RemoveImagesInput): Promise<
  ServiceResponse<
    null,
    {
      message: string;
      code:
        | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR
        | typeof HttpStatusCodes.CONFLICT;
    }
  >
> {
  try {
    for (const imageId of input.images) {
      await removeImage(imageId, input.force);
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    if (
      isDockerodeError(error) &&
      error.statusCode === HttpStatusCodes.CONFLICT
    ) {
      return {
        data: null,
        error: {
          message:
            "Cannot delete images with existing containers. Stop them or retry with force delete.",
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
