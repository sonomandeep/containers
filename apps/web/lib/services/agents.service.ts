"use server";

import {
  type Agent,
  agentSchema,
  createAgentSchema,
  type ServiceResponse,
  updateAgentSchema,
} from "@containers/shared";
import { updateTag } from "next/cache";
import z from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";
import { checkAuthentication } from "./auth.service";

const DUPLICATE_AGENT_NAME_ERROR = "An agent with this name already exists.";

export async function listAgents(): Promise<
  ServiceResponse<Array<Agent>, string>
> {
  const { cookies } = await checkAuthentication();

  const { data, error } = await $api("/agents", {
    method: "get",
    headers: {
      Cookie: cookies.toString(),
    },
    output: z.array(agentSchema),
    next: {
      tags: ["agents"],
    },
  });

  if (error) {
    logger.error(error);
    return {
      data: null,
      error: "Unexpected error while fetching agents.",
    };
  }

  return { data, error: null };
}

export async function createAgent(
  input: unknown
): Promise<ServiceResponse<Agent, string>> {
  const { cookies } = await checkAuthentication();

  const validation = createAgentSchema.safeParse(input);
  if (!validation.success) {
    logger.error(validation, "createAgent - validation error");
    return { data: null, error: "validation error" };
  }

  const { data, error } = await $api("/agents", {
    method: "post",
    headers: {
      Cookie: cookies.toString(),
      "content-type": "application/json",
    },
    body: JSON.stringify(validation.data),
    output: agentSchema,
  });

  if (error) {
    logger.error(error, "createAgent - api error");

    if (error.status === 409) {
      return {
        data: null,
        error: DUPLICATE_AGENT_NAME_ERROR,
      };
    }

    return {
      data: null,
      error: "Unexpected error while creating the agent.",
    };
  }

  updateTag("agents");

  return { data, error: null };
}

export async function removeAgent(
  id: string
): Promise<ServiceResponse<{ id: string }, string>> {
  const { cookies } = await checkAuthentication();
  const path = `/agents/${encodeURIComponent(id)}`;

  const { error } = await $api(path, {
    method: "delete",
    headers: {
      Cookie: cookies.toString(),
    },
  });

  if (error) {
    logger.error(error, "removeAgent - api error");

    if (error.status === 404) {
      return {
        data: null,
        error: "Agent not found.",
      };
    }

    return {
      data: null,
      error: "Unexpected error while deleting the agent.",
    };
  }

  updateTag("agents");

  return { data: { id }, error: null };
}

export async function updateAgent(
  id: string,
  input: unknown
): Promise<ServiceResponse<Agent, string>> {
  const { cookies } = await checkAuthentication();

  const validation = updateAgentSchema.safeParse(input);
  if (!validation.success) {
    logger.error(validation, "updateAgent - validation error");
    return { data: null, error: "validation error" };
  }

  const path = `/agents/${encodeURIComponent(id)}`;

  const { data, error } = await $api(path, {
    method: "patch",
    headers: {
      Cookie: cookies.toString(),
      "content-type": "application/json",
    },
    body: JSON.stringify(validation.data),
    output: agentSchema,
  });

  if (error) {
    logger.error(error, "updateAgent - api error");

    if (error.status === 404) {
      return {
        data: null,
        error: "Agent not found.",
      };
    }

    if (error.status === 409) {
      return {
        data: null,
        error: DUPLICATE_AGENT_NAME_ERROR,
      };
    }

    return {
      data: null,
      error: "Unexpected error while updating the agent.",
    };
  }

  updateTag("agents");

  return { data, error: null };
}
