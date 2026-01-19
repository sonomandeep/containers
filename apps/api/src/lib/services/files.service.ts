import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { ServiceResponse, StoredFile } from "@containers/shared";
import * as HttpStatusCodes from "stoker/http-status-codes";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import { db } from "@/db";
import { file as fileTable } from "@/db/schema";
import env from "@/env";

type UploadedFile = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

type UploadFileError = {
  message: string;
  code:
    | typeof HttpStatusCodes.BAD_REQUEST
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

function isUploadedFile(value: unknown): value is UploadedFile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const file = value as Partial<UploadedFile>;

  return (
    typeof file.name === "string" &&
    typeof file.type === "string" &&
    typeof file.size === "number" &&
    typeof file.arrayBuffer === "function"
  );
}

function sanitizeFilename(value: string) {
  const base = path.basename(value).trim();
  return base.length > 0 ? base : "upload";
}

function buildStorageKey(filename: string) {
  const extension = path.extname(filename);
  const id = crypto.randomUUID();
  return extension ? `${id}${extension}` : id;
}

export async function uploadFile(
  input: unknown
): Promise<ServiceResponse<StoredFile, UploadFileError>> {
  if (!isUploadedFile(input)) {
    return {
      data: null,
      error: {
        message: "File is required.",
        code: HttpStatusCodes.BAD_REQUEST,
      },
    };
  }

  const safeName = sanitizeFilename(input.name);
  const storageKey = buildStorageKey(safeName);
  const mimeType =
    input.type && input.type.length > 0
      ? input.type
      : "application/octet-stream";

  const filePath = path.join(env.UPLOAD_DIR, storageKey);

  try {
    await fs.mkdir(env.UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await input.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const [record] = await db
      .insert(fileTable)
      .values({
        id: crypto.randomUUID(),
        name: safeName,
        mimeType,
        size: input.size,
        storageKey,
      })
      .returning();

    if (!record) {
      await fs.unlink(filePath).catch(() => null);
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
          code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        },
      };
    }

    return {
      data: {
        id: record.id,
        name: record.name,
        mimeType: record.mimeType,
        size: record.size,
        storageKey: record.storageKey,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      },
      error: null,
    };
  } catch (_) {
    await fs.unlink(filePath).catch(() => null);
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}
