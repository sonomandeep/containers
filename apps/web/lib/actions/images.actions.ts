"use server";

import type { PullImageInput } from "@/lib/services/images.service";
import { pullImageInputSchema } from "@/lib/services/images.service";
import { validateFormData } from "@/lib/utils";

export interface PullImageActionFormState {
  data: Partial<PullImageInput>;
  error: Partial<PullImageInput> & { root?: string };
}

export async function pullImageAction(_prevState: PullImageActionFormState, formData: FormData): Promise<PullImageActionFormState> {
  const input = validateFormData(pullImageInputSchema, formData);
  if (!input.ok) {
    console.log("pullImageAction - validation error");
    return { data: input.data, error: input.errors };
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(input);

  return { data: input.data, error: null };
}
