"use server";

import {
  fileSchema,
  type ServiceResponse,
  type StoredFile,
} from "@containers/shared";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { NO_ACTIVE_WORKSPACE_ERROR } from "@/lib/constants/organizations";
import { $api } from "@/lib/fetch";
import { logger } from "@/lib/logger";
import { checkAuthentication } from "./auth.service";

const invitationPreviewSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: z.string().nullable().optional(),
  organizationId: z.string(),
  inviterId: z.string(),
  status: z.string(),
  expiresAt: z.union([z.string(), z.date()]),
  organizationName: z.string(),
  organizationSlug: z.string(),
  inviterEmail: z.string(),
});

const activeOrganizationSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable().optional(),
});

const pendingInvitationListSchema = z.array(
  z.object({
    id: z.string(),
  })
);

const pendingJoinInvitationSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
  organizationSlug: z.string(),
});

type InvitationPreview = z.infer<typeof invitationPreviewSchema>;
type ActiveOrganizationSummary = z.infer<
  typeof activeOrganizationSummarySchema
>;
type PendingJoinInvitation = z.infer<typeof pendingJoinInvitationSchema>;

type InvitationErrorDetails = {
  code: string | null;
  message: string;
};

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

export async function removeLogo(
  fileId: StoredFile["id"]
): Promise<ServiceResponse<null, string>> {
  const { cookies } = await checkAuthentication();

  const { error } = await $api(`/files/${encodeURIComponent(fileId)}`, {
    method: "delete",
    headers: {
      Cookie: cookies.toString(),
    },
  });

  if (error) {
    logger.error({ error, fileId }, "removeLogo error");

    if (error.status === 404) {
      return { data: null, error: null };
    }

    if (error.status === 500) {
      return {
        data: null,
        error: "Unexpected error while removing uploaded logo.",
      };
    }

    return {
      data: null,
      error:
        error.message ||
        error.statusText ||
        "Unexpected error while removing uploaded logo.",
    };
  }

  return { data: null, error: null };
}

export async function getActiveOrganizationSummary(): Promise<
  ServiceResponse<ActiveOrganizationSummary, string>
> {
  const { cookies } = await checkAuthentication();

  const { data, error } = await auth.organization.getFullOrganization({
    fetchOptions: {
      headers: {
        Cookie: cookies.toString(),
      },
    },
  });

  if (error) {
    logger.error(error, "getActiveOrganizationSummary error");
    return {
      data: null,
      error: "Unable to load active workspace.",
    };
  }

  if (!data) {
    return {
      data: null,
      error: NO_ACTIVE_WORKSPACE_ERROR,
    };
  }

  const parsedData = activeOrganizationSummarySchema.safeParse(data);
  if (!parsedData.success) {
    logger.error(
      {
        issues: parsedData.error.issues,
      },
      "invalid active organization payload"
    );

    return {
      data: null,
      error: "Unable to load active workspace.",
    };
  }

  return {
    data: parsedData.data,
    error: null,
  };
}

export async function listPendingJoinInvitations(): Promise<
  ServiceResponse<Array<PendingJoinInvitation>, string>
> {
  const { cookies } = await checkAuthentication();
  const cookieHeader = cookies.toString();

  const { data, error } = await auth.organization.listUserInvitations({
    fetchOptions: {
      headers: {
        Cookie: cookieHeader,
      },
    },
  });

  if (error || !data) {
    logger.error({ error }, "listPendingJoinInvitations error");
    return {
      data: null,
      error: "Unable to load pending invitations.",
    };
  }

  const parsedInvitations = pendingInvitationListSchema.safeParse(data);
  if (!parsedInvitations.success) {
    logger.error(
      {
        issues: parsedInvitations.error.issues,
      },
      "invalid pending invitations payload"
    );

    return {
      data: null,
      error: "Unable to load pending invitations.",
    };
  }

  const invitationsWithDetails = await Promise.allSettled(
    parsedInvitations.data.map(async (invitation) => {
      const { data: invitationDetail, error: invitationError } =
        await auth.organization.getInvitation({
          query: { id: invitation.id },
          fetchOptions: {
            headers: {
              Cookie: cookieHeader,
            },
          },
        });

      if (invitationError || !invitationDetail) {
        logger.warn(
          {
            error: invitationError,
            invitationId: invitation.id,
          },
          "pending invitation details lookup failed"
        );

        return null;
      }

      const parsedInvitation = pendingJoinInvitationSchema.safeParse({
        id: invitationDetail.id,
        organizationName: invitationDetail.organizationName,
        organizationSlug: invitationDetail.organizationSlug,
      });

      if (!parsedInvitation.success) {
        logger.error(
          {
            invitationId: invitation.id,
            issues: parsedInvitation.error.issues,
          },
          "invalid pending invitation detail payload"
        );

        return null;
      }

      return parsedInvitation.data;
    })
  );

  const invitations = invitationsWithDetails.flatMap((result) => {
    if (result.status === "fulfilled" && result.value) {
      return [result.value];
    }

    if (result.status === "rejected") {
      logger.error(
        {
          error: result.reason,
        },
        "pending invitation detail request failed"
      );
    }

    return [];
  });

  return {
    data: invitations,
    error: null,
  };
}

export async function getInvitationPreview(
  invitationId: string
): Promise<ServiceResponse<InvitationPreview, string>> {
  const normalizedInvitationId = invitationId.trim();
  if (!normalizedInvitationId) {
    return {
      data: null,
      error: "Invitation ID is required.",
    };
  }

  const { cookies } = await checkAuthentication();
  const { data, error } = await auth.organization.getInvitation({
    query: { id: normalizedInvitationId },
    fetchOptions: {
      headers: {
        Cookie: cookies.toString(),
      },
    },
  });

  if (error || !data) {
    logger.error(
      {
        error,
        invitationId: normalizedInvitationId,
      },
      "getInvitationPreview error"
    );

    return {
      data: null,
      error: mapInvitationPreviewError(error),
    };
  }

  const parsedData = invitationPreviewSchema.safeParse(data);
  if (!parsedData.success) {
    logger.error(
      {
        invitationId: normalizedInvitationId,
        issues: parsedData.error.issues,
      },
      "invalid invitation preview payload"
    );

    return {
      data: null,
      error: "Unable to load invitation details.",
    };
  }

  return {
    data: parsedData.data,
    error: null,
  };
}

function parseInvitationError(error: unknown): InvitationErrorDetails {
  if (!error) {
    return {
      code: null,
      message: "Unable to load invitation details.",
    };
  }

  if (typeof error === "string") {
    return {
      code: null,
      message: error,
    };
  }

  if (typeof error === "object") {
    const details = error as {
      code?: string;
      error?: string;
      error_description?: string;
      message?: string;
      statusText?: string;
    };

    return {
      code: typeof details.code === "string" ? details.code : null,
      message:
        details.message ||
        details.error_description ||
        details.error ||
        details.statusText ||
        "Unable to load invitation details.",
    };
  }

  return {
    code: null,
    message: "Unable to load invitation details.",
  };
}

function mapInvitationPreviewError(error: unknown) {
  const details = parseInvitationError(error);
  const normalizedCode = details.code?.toUpperCase();
  const normalizedMessage = details.message.toLowerCase();

  if (
    normalizedCode === "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION" ||
    normalizedMessage.includes("not the recipient")
  ) {
    return "This invitation belongs to another account.";
  }

  if (
    normalizedCode === "INVITATION_NOT_FOUND" ||
    normalizedMessage.includes("invitation not found")
  ) {
    return "This invitation is invalid or has expired.";
  }

  if (
    normalizedCode === "ORGANIZATION_NOT_FOUND" ||
    normalizedMessage.includes("organization not found")
  ) {
    return "This workspace is no longer available.";
  }

  return details.message;
}
