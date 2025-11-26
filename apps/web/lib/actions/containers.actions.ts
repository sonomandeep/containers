"use server";

import type { RemoveContainerInput } from "@/lib/services/containers.service";
import { logger } from "@/lib/logger";
import {
  removeContainer,
  removeContainerInputSchema,
} from "@/lib/services/containers.service";
import { validateFormData } from "@/lib/utils";

export interface RemoveContainerActionFormState {
  data: Partial<RemoveContainerInput>;
  error: Partial<RemoveContainerInput> & { root?: string };
}

export async function removeContainerAction(
  _prevState: RemoveContainerActionFormState,
  formData: FormData,
): Promise<RemoveContainerActionFormState> {
  const input = validateFormData(removeContainerInputSchema, formData);

  if (!input.ok) {
    logger.debug(input, "removeContainerAction - validation error");
    return { data: input.data, error: input.errors };
  }

  const { error } = await removeContainer(input.data);

  if (error) {
    return {
      data: input.data,
      error: { root: "Unexpected error while deleting the container." },
    };
  }

  return { data: input.data, error: null };
}
