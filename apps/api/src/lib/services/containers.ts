import type { LaunchContainerInput, ServiceResponse } from "@containers/shared";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { docker } from "@/lib/agent";
import { isDockerodeError } from "@/lib/utils";

interface LaunchContainerError {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
}

interface RemoveContainerInput {
  containerId: string;
  force?: boolean;
}

interface RemoveContainerError {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
}

interface StopContainerInput {
  containerId: string;
}

interface StopContainerError {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
}

interface StartContainerInput {
  containerId: string;
}

interface StartContainerError {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.CONFLICT
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
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

export async function stopContainer(
  input: StopContainerInput
): Promise<ServiceResponse<null, StopContainerError>> {
  try {
    const container = docker.getContainer(input.containerId);
    await container.stop();

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

      if (
        error.statusCode === HttpStatusCodes.CONFLICT ||
        error.statusCode === HttpStatusCodes.NOT_MODIFIED
      ) {
        return {
          data: null,
          error: {
            message: "Container is not running.",
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

export async function startContainer(
  input: StartContainerInput
): Promise<ServiceResponse<null, StartContainerError>> {
  try {
    const container = docker.getContainer(input.containerId);
    await container.start();

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

function normalizePorts(
  ports?: Array<{ hostPort: string; containerPort: string }>
): {
  ExposedPorts?: Record<string, object>;
  PortBindings?: Record<string, Array<{ HostPort: string }>>;
} {
  if (!ports?.length) {
    return {};
  }

  const exposedPorts: Record<string, object> = {};
  const portBindings: Record<string, Array<{ HostPort: string }>> = {};

  for (const mapping of ports) {
    const containerPort = mapping.containerPort?.trim();
    const hostPort = mapping.hostPort?.trim();

    if (!(containerPort && hostPort)) {
      continue;
    }

    const portKey = `${containerPort}/tcp`;
    exposedPorts[portKey] = {};

    if (!portBindings[portKey]) {
      portBindings[portKey] = [];
    }

    portBindings[portKey].push({ HostPort: hostPort });
  }

  return {
    ExposedPorts: Object.keys(exposedPorts).length ? exposedPorts : undefined,
    PortBindings: Object.keys(portBindings).length ? portBindings : undefined,
  };
}
