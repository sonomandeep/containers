"use server";

import { logger } from "@/lib/logger";
import type {
  PullImageInput,
  RemoveImagesInput,
} from "@/lib/services/images.service";
import {
  pullImage,
  pullImageInputSchema,
  removeImages,
  removeImagesInputSchema,
} from "@/lib/services/images.service";
import { validateFormData } from "@/lib/utils";

export type PullImageActionFormState = {
  data: Partial<PullImageInput>;
  error: (Partial<PullImageInput> & { root?: string }) | null;
};

export async function pullImageAction(
  _prevState: PullImageActionFormState,
  formData: FormData
): Promise<PullImageActionFormState> {
  const input = validateFormData(pullImageInputSchema, formData);
  if (!input.ok) {
    logger.debug(input, "pullImageAction - validation error");
    return { data: input.data, error: input.errors };
  }

  const { error } = await pullImage(input.data);

  if (error) {
    if (error.status === 404) {
      return {
        data: input.data,
        error: { root: "Image not found on the registry." },
      };
    }

    return {
      data: input.data,
      error: { root: "Unexpected error while pulling the image." },
    };
  }

  return { data: input.data, error: null };
}

export type RemoveImagesActionFormState = {
  data: Partial<RemoveImagesInput>;
  error: (Partial<RemoveImagesInput> & { root?: string }) | null;
};

export async function removeImagesAction(
  _prevState: RemoveImagesActionFormState,
  formData: FormData
): Promise<RemoveImagesActionFormState> {
  const input = validateFormData(removeImagesInputSchema, formData);
  if (!input.ok) {
    logger.debug(input, "removeImagesAction - validation error");
    return { data: input.data, error: input.errors };
  }

  const { error } = await removeImages(input.data);

  if (error) {
    if (error.status === 409) {
      return {
        data: input.data,
        error: {
          root: input.data.force
            ? "Docker reported containers still referencing these images. Stop them manually and retry."
            : "Stop and remove all containers that use the selected images or enable Force delete.",
        },
      };
    }

    return {
      data: input.data,
      error: { root: "Unexpected error while deleting the selected images." },
    };
  }

  return { data: input.data, error: null };
}
