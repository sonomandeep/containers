/* biome-ignore-all lint: temp */

import type { ContainerState, Image } from "@containers/shared";
import Docker from "dockerode";

export const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export async function listImages(): Promise<Array<Image>> {
  const [images, containers] = await Promise.all([
    docker.listImages({ all: true }),
    docker.listContainers({ all: true }),
  ]);

  const containerStateByImage = new Map<string, Image["containers"]>();

  for (const container of containers) {
    const imageId = container.ImageID;

    if (!imageId) {
      continue;
    }

    const normalizedState = normalizeContainerState(container.State);
    const counts = containerStateByImage.get(imageId);

    if (counts) {
      counts[normalizedState] += 1;
      continue;
    }

    const nextCounts = createEmptyContainerCounts();
    nextCounts[normalizedState] += 1;
    containerStateByImage.set(imageId, nextCounts);
  }

  return images.map((image) => ({
    id: image.Id,
    repoTags: image.RepoTags ?? [],
    repoDigests: image.RepoDigests ?? [],
    created: image.Created,
    size: image.Size,
    sharedSize: image.SharedSize ?? 0,
    virtualSize: image.VirtualSize ?? 0,
    containers:
      containerStateByImage.get(image.Id) ?? createEmptyContainerCounts(),
  }));
}

function createEmptyContainerCounts(): Image["containers"] {
  return {
    running: 0,
    paused: 0,
    exited: 0,
  };
}

function normalizeContainerState(state: string | undefined): ContainerState {
  if (state === "running" || state === "paused") {
    return state;
  }

  return "exited";
}
