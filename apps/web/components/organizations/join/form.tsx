"use client";

import { AlertCircleIcon, CornerDownLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";

type JoinInvitationDecisionFormProps = {
  invitationId: string;
  inviterEmail: string;
  organizationName: string;
  workspaceSlug: string;
};

type InvitationAction = "accept" | "decline";

export function JoinInvitationDecisionForm({
  invitationId,
  inviterEmail,
  organizationName,
  workspaceSlug,
}: JoinInvitationDecisionFormProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<InvitationAction | null>(
    null
  );
  const [rootError, setRootError] = useState<string | null>(null);

  const isPending = pendingAction !== null;

  async function handleInvitationAction(action: InvitationAction) {
    setPendingAction(action);
    setRootError(null);

    const result = await executeInvitationAction(action, invitationId);
    if (result.error) {
      setRootError(result.error);
      setPendingAction(null);
      return;
    }

    if (action === "accept") {
      router.replace(`/${workspaceSlug}/containers`);
      return;
    }

    router.replace("/onboarding/join");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-card-border bg-card px-3 py-2">
        <p className="text-sm/relaxed">
          <span className="font-semibold">{inviterEmail}</span> has invited you
          to join the <span className="font-semibold">{organizationName}</span>{" "}
          workspace.
        </p>
      </div>

      {rootError && (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertCircleIcon className="size-3" />
            <AlertTitle>{rootError}</AlertTitle>
          </div>
        </Alert>
      )}

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          disabled={isPending}
          onClick={() => handleInvitationAction("decline")}
          type="button"
          variant="secondary"
        >
          Decline
          {pendingAction === "decline" && (
            <Spinner className="size-3 opacity-60" />
          )}
        </Button>

        <Button
          disabled={isPending}
          onClick={() => handleInvitationAction("accept")}
          type="button"
          variant="default"
        >
          Approve
          {pendingAction === "accept" ? (
            <Spinner className="size-3 opacity-60" />
          ) : (
            <CornerDownLeftIcon className="size-3 opacity-60" />
          )}
        </Button>
      </div>
    </div>
  );
}

async function executeInvitationAction(
  action: InvitationAction,
  invitationId: string
) {
  try {
    const response =
      action === "accept"
        ? await auth.organization.acceptInvitation({ invitationId })
        : await auth.organization.rejectInvitation({ invitationId });

    if (response.error) {
      return {
        error: parseInvitationLookupError(response.error),
      };
    }

    return {
      error: null,
    };
  } catch (error) {
    return {
      error: parseInvitationLookupError(error),
    };
  }
}

function parseInvitationLookupError(error: unknown) {
  const details = extractInvitationErrorDetails(error);
  return mapInvitationErrorMessage(details) || details.message;
}

const INVITATION_ERROR_MAPPINGS = [
  {
    code: "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION",
    includes: "not the recipient",
    message: "This invitation belongs to another account.",
  },
  {
    code: "INVITATION_NOT_FOUND",
    includes: "invitation not found",
    message: "This invitation is invalid or has expired.",
  },
  {
    code: "ORGANIZATION_NOT_FOUND",
    includes: "organization not found",
    message: "This workspace is no longer available.",
  },
  {
    code: "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION",
    includes: "email verification required",
    message: "Verify your email before responding to this invitation.",
  },
  {
    code: "ORGANIZATION_MEMBERSHIP_LIMIT_REACHED",
    includes: "membership limit",
    message: "This workspace has reached its member limit.",
  },
] as const;

function extractInvitationErrorDetails(error: unknown) {
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

  if (typeof error !== "object") {
    return {
      code: null,
      message: "Unable to load invitation details.",
    };
  }

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

function mapInvitationErrorMessage(details: {
  code: string | null;
  message: string;
}) {
  const normalizedCode = details.code?.toUpperCase();
  const normalizedMessage = details.message.toLowerCase();

  for (const mapping of INVITATION_ERROR_MAPPINGS) {
    if (
      normalizedCode === mapping.code ||
      normalizedMessage.includes(mapping.includes)
    ) {
      return mapping.message;
    }
  }

  return null;
}
