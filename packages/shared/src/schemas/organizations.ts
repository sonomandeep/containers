import z from "zod";

const ORGANIZATION_NAME_MAX_LENGTH = 100;
const ORGANIZATION_SLUG_MAX_LENGTH = 100;
const ORGANIZATION_LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024;

const organizationNameSchema = z
  .string()
  .trim()
  .min(1, "Workspace name is required")
  .max(
    ORGANIZATION_NAME_MAX_LENGTH,
    `Workspace name must not exceed ${ORGANIZATION_NAME_MAX_LENGTH} characters`
  );

const organizationSlugSchema = z
  .string()
  .trim()
  .min(1, "Workspace handle is required")
  .max(
    ORGANIZATION_SLUG_MAX_LENGTH,
    `Workspace handle must not exceed ${ORGANIZATION_SLUG_MAX_LENGTH} characters`
  )
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      "Workspace handle can only include lowercase letters, numbers, and hyphens",
  });

const organizationLogoUrlSchema = z
  .string()
  .url("Logo URL must be a valid URL")
  .optional();

const acceptedLogoMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

type AcceptedLogoMimeType = (typeof acceptedLogoMimeTypes)[number];

type FileLike = {
  size: number;
  type: string;
};

function isFileLike(value: unknown): value is FileLike {
  if (!value || typeof value !== "object") {
    return false;
  }

  const file = value as Partial<FileLike>;
  return typeof file.size === "number" && typeof file.type === "string";
}

function isAcceptedLogoMimeType(value: string): value is AcceptedLogoMimeType {
  return acceptedLogoMimeTypes.includes(value as AcceptedLogoMimeType);
}

const organizationLogoFileSchema = z
  .unknown()
  .nullish()
  .superRefine((value, context) => {
    if (value === null || value === undefined) {
      return;
    }

    if (!isFileLike(value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please upload a valid logo file",
      });
      return;
    }

    if (!isAcceptedLogoMimeType(value.type)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Logo must be a PNG, JPG, or WEBP image",
      });
    }

    if (value.size > ORGANIZATION_LOGO_MAX_SIZE_BYTES) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Logo must be 2MB or smaller",
      });
    }
  });

export const organizationSchema = z.object({
  id: z.string(),
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  logo: organizationLogoUrlSchema,
});
export type Organization = z.infer<typeof organizationSchema>;

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
  logo: organizationLogoFileSchema,
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
