"use server";

import {
  type Agent,
  agentSchema,
  type ServiceResponse,
} from "@containers/shared";
import z from "zod";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";
import { checkAuthentication } from "./auth.service";

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
