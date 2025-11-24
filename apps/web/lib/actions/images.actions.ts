"use server";

import type { PullImageInput } from "@/lib/services/images.service";
import { logger } from "@/lib/logger";
import { pullImage, pullImageInputSchema } from "@/lib/services/images.service";
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

  const { error } = await pullImage(input.data);

  if (error) {
    if (error.status === 404) {
      return { data: input.data, error: { root: "Image not found on the registry." } };
    }

    return { data: input.data, error: { root: "Unexpected error while pulling the image." } };
  }

  return { data: input.data, error: null };
}
