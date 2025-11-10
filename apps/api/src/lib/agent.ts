import type { Container, ContainerState } from "@containers/shared";
import Docker from "dockerode";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export async function listContainers(): Promise<Array<Container>> {
  const containers = await docker.listContainers({ all: true });
  containers.forEach((container) => console.debug(container.Ports));

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
