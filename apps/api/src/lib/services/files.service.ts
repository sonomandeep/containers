import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { ServiceResponse, StoredFile } from "@containers/shared";
import { eq } from "drizzle-orm";
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

function buildFileUrl(storageKey: string) {
  return new URL(`/uploads/${storageKey}`, env.APP_URL).toString();
}

function isNoEntryError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ENOENT"
  );
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
        url: buildFileUrl(record.storageKey),
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

type RemoveFileError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

export async function removeFile(
  fileId: string
): Promise<ServiceResponse<null, RemoveFileError>> {
  try {
    const records = await db
      .select()
      .from(fileTable)
      .where(eq(fileTable.id, fileId))
      .limit(1);

    const record = records.at(0);
    if (!record) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.NOT_FOUND,
          code: HttpStatusCodes.NOT_FOUND,
        },
      };
    }

    const filePath = path.join(env.UPLOAD_DIR, record.storageKey);
    await fs.unlink(filePath).catch((error) => {
      if (isNoEntryError(error)) {
        return;
      }

      throw error;
    });

    await db.delete(fileTable).where(eq(fileTable.id, record.id));

    return {
      data: null,
      error: null,
    };
  } catch (_error) {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}

type GetFileError = {
  message: string;
  code:
    | typeof HttpStatusCodes.NOT_FOUND
    | typeof HttpStatusCodes.INTERNAL_SERVER_ERROR;
};

export async function getFileById(
  fileId: string
): Promise<ServiceResponse<StoredFile, GetFileError>> {
  try {
    const records = await db
      .select()
      .from(fileTable)
      .where(eq(fileTable.id, fileId))
      .limit(1);

    const record = records.at(0);
    if (!record) {
      return {
        data: null,
        error: {
          message: HttpStatusPhrases.NOT_FOUND,
          code: HttpStatusCodes.NOT_FOUND,
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
        url: buildFileUrl(record.storageKey),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      } satisfies StoredFile,
      error: null,
    };
  } catch (_error) {
    return {
      data: null,
      error: {
        message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
        code: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      },
    };
  }
}
