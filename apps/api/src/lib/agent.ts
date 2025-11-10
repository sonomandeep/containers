import type { Container, ContainerState, Image } from "@containers/shared";
import Docker from "dockerode";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export async function listContainers(): Promise<Array<Container>> {
  const containers = await docker.listContainers({ all: true });

  return containers.map((container) => ({
    id: container.Id,
    name: container.Names.at(0) || "Not Available",
    image: container.Image,
    state: container.State as ContainerState,
    ports: container.Ports.map((port) => ({
      ip: port.IP,
      privatePort: port.PrivatePort,
      publicPort: port.PublicPort,
      type: port.Type,
    })),
    created: container.Created,
  }));
}

export async function listImages(): Promise<Array<Image>> {
  const images = await docker.listImages({ all: true });

  return images.map((image) => ({
    id: image.Id,
    repoTags: image.RepoTags ?? [],
    repoDigests: image.RepoDigests ?? [],
    created: image.Created,
    size: image.Size,
    sharedSize: image.SharedSize ?? 0,
    virtualSize: image.VirtualSize ?? 0,
    containers: image.Containers ?? 0,
  }));
}
