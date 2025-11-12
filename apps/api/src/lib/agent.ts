import type {
  Container,
  ContainerMetrics,
  ContainerState,
  Image,
} from "@containers/shared";
import Docker from "dockerode";

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

export async function listContainers(): Promise<Array<Container>> {
  const containers = await docker.listContainers({ all: true });
  const metricsByContainer = await Promise.all(
    containers.map((container) =>
      container.State === "running"
        ? collectContainerMetrics(container.Id)
        : Promise.resolve<ContainerMetrics | undefined>(undefined),
    ),
  );

  return containers.map((container, index) => ({
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
    metrics: metricsByContainer[index],
  }));
}

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

async function collectContainerMetrics(
  containerId: string,
): Promise<ContainerMetrics | undefined> {
  try {
    const stats = await docker.getContainer(containerId).stats({
      stream: false,
    });

    return normalizeMetrics(stats);
  } catch (error) {
    console.error(
      "Failed to collect metrics for container",
      containerId,
      error,
    );
    return undefined;
  }
}

function normalizeMetrics(stats: Docker.Stats): ContainerMetrics {
  const cpuPercent = calculateCpuPercent(stats);
  const memoryUsage = stats.memory_stats?.usage ?? null;
  const memoryLimit = stats.memory_stats?.limit ?? null;
  const { rx, tx } = aggregateNetworkIo(stats);

  return {
    cpuPercent,
    memoryUsage,
    memoryLimit,
    networkRx: rx,
    networkTx: tx,
  };
}

function calculateCpuPercent(stats: Docker.Stats): number | null {
  const currentTotal = stats.cpu_stats?.cpu_usage?.total_usage ?? 0;
  const previousTotal = stats.precpu_stats?.cpu_usage?.total_usage ?? 0;
  const currentSystem = stats.cpu_stats?.system_cpu_usage ?? 0;
  const previousSystem = stats.precpu_stats?.system_cpu_usage ?? 0;

  const cpuDelta = currentTotal - previousTotal;
  const systemDelta = currentSystem - previousSystem;
  const cpuCount =
    stats.cpu_stats?.online_cpus ??
    stats.cpu_stats?.cpu_usage?.percpu_usage?.length ??
    1;

  if (cpuDelta > 0 && systemDelta > 0 && cpuCount > 0) {
    const percent = (cpuDelta / systemDelta) * cpuCount * 100;
    if (Number.isFinite(percent)) {
      return percent;
    }
  }

  if (currentTotal > 0 && currentSystem > 0 && cpuCount > 0) {
    const percent = (currentTotal / currentSystem) * cpuCount * 100;
    return Number.isFinite(percent) ? percent : null;
  }

  return null;
}

function aggregateNetworkIo(stats: Docker.Stats): {
  rx: number | null;
  tx: number | null;
} {
  const networks = stats.networks;

  if (!networks) {
    return { rx: null, tx: null };
  }

  let rx = 0;
  let tx = 0;

  for (const networkStats of Object.values(networks)) {
    rx += networkStats.rx_bytes ?? 0;
    tx += networkStats.tx_bytes ?? 0;
  }

  return {
    rx: rx || null,
    tx: tx || null,
  };
}
