"use server";

import type { PullImageInput } from "@/lib/services/images.service";
import { logger } from "@/lib/logger";
import { pullImageInputSchema } from "@/lib/services/images.service";
import { validateFormData } from "@/lib/utils";

export interface PullImageActionFormState {
  data: Partial<PullImageInput>;
  error: Partial<PullImageInput> & { root?: string };
}

export async function pullImageAction(_prevState: PullImageActionFormState, formData: FormData): Promise<PullImageActionFormState> {
  const input = validateFormData(pullImageInputSchema, formData);
  if (!input.ok) {
    logger.debug(input, "pullImageAction - validation error");
    return { data: input.data, error: input.errors };
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  logger.debug(input);

  return { data: input.data, error: null };
}
