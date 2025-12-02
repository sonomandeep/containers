import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
}

type RawInputValue = FormDataEntryValue | FormDataEntryValue[];
type RawInput = Record<string, RawInputValue>;

type ValidationResult<TSchema extends z.ZodTypeAny> =
  | { ok: true; data: z.infer<TSchema>; errors: null }
  | { ok: false; data: RawInput; errors: Record<string, string> };

export function validateFormData<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  formData: FormData
): ValidationResult<TSchema> {
  const rawEntries = Array.from(formData.entries());
  const raw = rawEntries.reduce<RawInput>((acc, [key, value]) => {
    if (key in acc) {
      const current = acc[key];
      if (Array.isArray(current)) {
        current.push(value);
      } else {
        acc[key] = [current, value];
      }
    } else {
      acc[key] = value;
    }

    return acc;
  }, {});
  const result = schema.safeParse(raw);

  if (!result.success) {
    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !errors[field]) {
        errors[field] = issue.message;
      }
    }

    return { ok: false, data: raw, errors };
  }

  return { ok: true, data: result.data, errors: null };
}
