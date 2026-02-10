"use server";

import {
  fileSchema,
  type ServiceResponse,
  type StoredFile,
} from "@containers/shared";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";
import { checkAuthentication } from "./auth.service";

export async function uploadLogo(
  file: File
): Promise<ServiceResponse<StoredFile, string>> {
  const { cookies } = await checkAuthentication();
  const body = new FormData();
  body.set("file", file);

  const { data, error } = await $api("/files", {
    method: "post",
    body,
    headers: {
      Cookie: cookies.toString(),
    },
    output: fileSchema,
  });

  if (error) {
    logger.error(error, "uploadLogo error");

    if (error.status === 400) {
      return { data: null, error: "Invalid logo file." };
    }

    if (error.status === 500) {
      return {
        data: null,
        error: "Unexpected error while uploading logo.",
      };
    }

    return {
      data: null,
      error:
        error.message ||
        error.statusText ||
        "Unexpected error while uploading logo.",
    };
  }

  return { data, error: null };
}
