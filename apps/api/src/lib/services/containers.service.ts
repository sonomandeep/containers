import os from "node:os";
import type {
  Container,
  ContainerMetrics,
  ContainerState,
  EnvironmentVariable,
  LaunchContainerInput,
  ServiceResponse,
} from "@containers/shared";
import { containerSchema } from "@containers/shared";
import type { RedisClient } from "bun";
import type Dockerode from "dockerode";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";
import { buildCommand } from "@/lib/services/agent-commands.service";
import { isDockerodeError } from "@/lib/utils";
import { agentsRegistry } from "@/routes/agents/agents.service";

type LaunchContainerError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type RemoveContainerInput = {
  containerId: string;
  force?: boolean;
};

type RemoveContainerError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type RestartContainerInput = {
  containerId: string;
};

type StartContainerInput = {
  containerId: string;
};

type StartContainerError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

type RestartContainerError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

export async function listContainers(redis: RedisClient): Promise<
  ServiceResponse<
    Array<Container>,
    {
      message: string;
      code: typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
  >
> {
  try {
    const cached = await redis.hgetall("containers");
    const values = Object.values(cached);
    const parsed = values.map((value) => JSON.parse(value));
    const validation = containerSchema.array().safeParse(parsed);

    if (!validation.success) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
          code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        },
      };
    }

    return { data: validation.data, error: null };
  } catch {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

function formatContainerInspectInfo(
  info: Dockerode.ContainerInspectInfo,
  envs: Array<EnvironmentVariable>,
  metrics?: ContainerMetrics | undefined
): Container {
  return {
    id: info.Id,
    name: info.Name?.replace("/", "") || "-",
    image: info.Config.Image,
    state: info.State.Status as ContainerState,
    status: `${info.State.Status}${info.State.Running ? " (running)" : ""}`,
    ports: Object.entries(info.NetworkSettings.Ports || {}).flatMap(
      ([portKey, hostConfigs]) => {
        const [privatePort, type] = portKey.split("/");
        return hostConfigs === null
          ? [{ ipVersion: "", private: +privatePort, type }]
          : hostConfigs.map(({ HostIp, HostPort }) => ({
              ipVersion: HostIp === "0.0.0.0" ? "IPv4" : "IPv6",
              private: +privatePort,
              ...(HostPort && { public: +HostPort }),
              type,
            }));
      }
    ),
    envs,
    metrics,
    created: new Date(info.Created).getTime() / 1000,
    host: os.hostname(),
  };
}

function getContainerEnvs(
  inspect: Dockerode.ContainerInspectInfo
): Array<EnvironmentVariable> {
  const items = inspect.Config.Env.map((item) => {
    const [key, ...value] = item.split("=");
    return {
      key,
      value: value.join("="),
    };
  });

  return items;
}

async function getContainerMetrics(id: string) {
  const container = docker.getContainer(id);
  const stats = await container.stats({ stream: false });
  const inspect = await container.inspect();

  const cpu = getCpuUsage(stats, getContainerCPUInfo(inspect));
  const memory = getMemoryUsage(stats);

  return {
    cpu,
    memory,
  };
}

function getContainerCPUInfo(inspect: Dockerode.ContainerInspectInfo) {
  const nanoCpus = inspect.HostConfig.NanoCpus;

  if (!nanoCpus || nanoCpus === 0) {
    return null;
  }

  return nanoCpus / 1e9;
}

function getCpuUsage(stats: Dockerode.ContainerStats, cores: number | null) {
  const cpuDelta =
    stats.cpu_stats.cpu_usage.total_usage -
    stats.precpu_stats.cpu_usage.total_usage;

  const systemDelta =
    stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage;

  const cpuCount =
    stats.cpu_stats.online_cpus ||
    stats.cpu_stats.cpu_usage.percpu_usage?.length ||
    1;

  let cpuPercent = 0;

  if (systemDelta > 0 && cpuDelta > 0) {
    cpuPercent = (cpuDelta / systemDelta) * cpuCount * 100;
  }

  if (cores !== null) {
    cpuPercent /= cores;
  }

  if (cpuPercent > 100) {
    cpuPercent = 100;
  }

  return Number(cpuPercent.toFixed(1));
}

function getMemoryUsage(stats: Dockerode.ContainerStats) {
  const used =
    stats.memory_stats.usage - (stats.memory_stats.stats?.cache || 0);

  const total = stats.memory_stats.limit;

  return {
    used,
    total,
  };
}

export async function removeContainer(
  input: RemoveContainerInput
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

export function stopContainer(
  agentId: string,
  containerId: string
): ServiceResponse<
  { commandId: string },
  {
    message: string;
    code:
      | typeof HttpStatusCodes.SERVICE_UNAVAILABLE
      | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
  }
> {
  try {
    const command = buildCommand({
      name: "container.stop",
      payload: {
        containerId,
      },
    });

    const { error } = agentsRegistry.sendTo(agentId, JSON.stringify(command));

    if (error) {
      return {
        data: null,
        error: {
          message: error,
          code: HttpStatusCodes.SERVICE_UNAVAILABLE,
        },
      };
    }

    return {
      data: {
        commandId: command.data.id,
      },
      error: null,
    };
  } catch {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

export async function startContainer(
  input: StartContainerInput
): Promise<ServiceResponse<Container, StartContainerError>> {
  try {
    const container = docker.getContainer(input.containerId);
    await container.start();
    const info = await container.inspect();
    const envs = getContainerEnvs(info);
    const metrics = await getContainerMetrics(container.id);

    return {
      data: formatContainerInspectInfo(info, envs, metrics),
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

      if (
        error.statusCode === HttpStatusCodes.CONFLICT ||
        error.statusCode === HttpStatusCodes.NOT_MODIFIED
      ) {
        return {
          data: null,
          error: {
            message: "Container is already running.",
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

export async function restartContainer(
  input: RestartContainerInput
): Promise<ServiceResponse<Container, RestartContainerError>> {
  try {
    const container = docker.getContainer(input.containerId);
    await container.restart();
    const info = await container.inspect();
    const envs = getContainerEnvs(info);
    const metrics = await getContainerMetrics(container.id);

    return {
      data: formatContainerInspectInfo(info, envs, metrics),
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

      if (
        error.statusCode === HttpStatusCodes.CONFLICT ||
        error.statusCode === HttpStatusCodes.NOT_MODIFIED
      ) {
        return {
          data: null,
          error: {
            message: "Container is already running.",
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

export async function launchContainer(
  input: LaunchContainerInput
): Promise<ServiceResponse<{ id: string }, LaunchContainerError>> {
  try {
    const { ExposedPorts, PortBindings } = normalizePorts(input.ports);
    const container = await docker.createContainer({
      name: input.name,
      Image: input.image,
      Cmd: parseCommand(input.command),
      Env: normalizeEnvs(input.envs),
      HostConfig: {
        RestartPolicy: { Name: input.restartPolicy },
        NanoCpus: normalizeCpu(input.cpu),
        Memory: normalizeMemory(input.memory),
        NetworkMode: input.network ?? undefined,
        PortBindings,
      },
      ExposedPorts,
    });

    await container.start();

    return {
      data: { id: container.id },
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
            message: "A container with the same name already exists.",
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

export async function updateContainerEnvs(
  id: string,
  envs: Array<EnvironmentVariable>
): Promise<
  ServiceResponse<{ id: string; envs: Array<EnvironmentVariable> }, string>
> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.error({ id, envs }, "update container envs not implented");

  return { data: null, error: "not implemented" };
}

const commandRegEx = /^"(.*)"$/;

function parseCommand(command?: string): Array<string> | undefined {
  if (!command?.trim()) {
    return;
  }

  const parts = command.match(/(?:[^\s"]|"[^"]*")+/g);
  if (!parts) {
    return;
  }

  return parts.map((part) => part.replace(commandRegEx, "$1"));
}

function normalizeEnvs(
  envs?: Array<{ key: string; value: string }>
): Array<string> | undefined {
  if (!envs?.length) {
    return;
  }

  return envs
    .filter((env) => env.key.trim() && env.value.trim())
    .map((env) => `${env.key}=${env.value}`);
}

function normalizeCpu(cpu?: string): number | undefined {
  if (!cpu) {
    return;
  }

  const numericCpu = Number.parseFloat(cpu);
  if (!Number.isFinite(numericCpu) || numericCpu <= 0) {
    return;
  }

  return Math.round(numericCpu * 1_000_000_000);
}

function normalizeMemory(memory?: string): number | undefined {
  if (!memory) {
    return;
  }

  const memoryMb = Number.parseInt(memory, 10);
  if (!Number.isFinite(memoryMb) || memoryMb <= 0) {
    return;
  }

  return memoryMb * 1024 * 1024;
}

function normalizePorts(ports?: Array<{ public: string; private: string }>): {
  ExposedPorts?: Record<string, object>;
  PortBindings?: Record<string, Array<{ HostPort: string }>>;
} {
  if (!ports?.length) {
    return {};
  }

  const exposedPorts: Record<string, object> = {};
  const portBindings: Record<string, Array<{ HostPort: string }>> = {};

  for (const mapping of ports) {
    const publicPort = mapping.public?.trim();
    const privatePort = mapping.private?.trim();

    if (!(publicPort && privatePort)) {
      continue;
    }

    const portKey = `${privatePort}/tcp`;
    exposedPorts[portKey] = {};

    if (!portBindings[portKey]) {
      portBindings[portKey] = [];
    }

    portBindings[portKey].push({ HostPort: publicPort });
  }

  return {
    ExposedPorts: Object.keys(exposedPorts).length ? exposedPorts : undefined,
    PortBindings: Object.keys(portBindings).length ? portBindings : undefined,
  };
}
