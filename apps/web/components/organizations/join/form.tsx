"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BadgeCheckIcon,
  CornerDownLeftIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";

const joinInvitationIdSchema = z.object({
  invitationId: z
    .string()
    .trim()
    .min(1, "Invitation ID is required.")
    .refine((value) => !isInviteLink(value), {
      message: "Enter the invitation ID only.",
    }),
});

const invitationLookupSchema = z.object({
  organizationName: z.string(),
  inviterEmail: z.string(),
});

type JoinInvitationIdInput = z.infer<typeof joinInvitationIdSchema>;

type JoinInvitationIdFormProps = {
  initialInvitationId?: string;
};

type JoinInvitationDecisionFormProps = {
  inviterEmail: string;
  organizationName: string;
};

type InvitationDecision = "idle" | "accepted" | "declined";

function normalizeInvitationId(value: string) {
  return value.trim();
}

function isInviteLink(value: string) {
  return (
    value.includes("://") ||
    value.includes("/") ||
    value.includes("?") ||
    value.includes("&") ||
    value.includes("=")
  );
}

export function JoinInvitationIdForm({
  initialInvitationId,
}: JoinInvitationIdFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<JoinInvitationIdInput>({
    resolver: zodResolver(joinInvitationIdSchema),
    defaultValues: {
      invitationId: normalizeInvitationId(initialInvitationId ?? ""),
    },
  });

  async function handleContinue(input: JoinInvitationIdInput) {
    setIsPending(true);
    form.clearErrors("root");

    const invitationId = normalizeInvitationId(input.invitationId);

    const preview = await lookupInvitationPreview(invitationId);
    if (!preview.data || preview.error) {
      form.setError("root", {
        message: preview.error || "Unable to load invitation details.",
      });
      setIsPending(false);
      return;
    }

    router.replace(
      buildJoinInvitationDetailUrl({
        invitationId,
        organizationName: preview.data.organizationName,
        inviterEmail: preview.data.inviterEmail,
      })
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleContinue)}
    >
      <Controller
        control={form.control}
        disabled={isPending}
        name="invitationId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Invitation ID</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoCapitalize="off"
              autoCorrect="off"
              id={field.name}
              placeholder="inv_123456"
              spellCheck={false}
              type="text"
            />
            <FieldDescription>
              Enter the invitation ID from your invite email.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {form.formState.errors.root && (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertCircleIcon className="size-3" />
            <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
          </div>
        </Alert>
      )}

      <Button className="w-full" disabled={isPending} type="submit">
        Continue
        {isPending ? (
          <Spinner className="size-3 opacity-60" />
        ) : (
          <CornerDownLeftIcon className="size-3 opacity-60" />
        )}
      </Button>
    </form>
  );
}

export function JoinInvitationDecisionForm({
  inviterEmail,
  organizationName,
}: JoinInvitationDecisionFormProps) {
  const [decision, setDecision] = useState<InvitationDecision>("idle");

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-card-border bg-card px-3 py-2">
        <p className="text-sm/relaxed">
          <span className="font-semibold">{inviterEmail}</span> has invited you
          to join the <span className="font-semibold">{organizationName}</span>{" "}
          workspace.
        </p>
      </div>

      {decision === "accepted" && (
        <Alert variant="info">
          <div className="inline-flex items-center gap-2">
            <BadgeCheckIcon className="size-3" />
            <AlertTitle>Invitation accepted.</AlertTitle>
          </div>
        </Alert>
      )}

      {decision === "declined" && (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertTriangleIcon className="size-3" />
            <AlertTitle>Invitation declined.</AlertTitle>
          </div>
        </Alert>
      )}

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          onClick={() => setDecision("declined")}
          type="button"
          variant="secondary"
        >
          Decline
        </Button>

        <Button
          onClick={() => setDecision("accepted")}
          type="button"
          variant="default"
        >
          Approve
          <CornerDownLeftIcon className="size-3 opacity-60" />
        </Button>
      </div>
    </div>
  );
}

function buildJoinInvitationDetailUrl({
  invitationId,
  organizationName,
  inviterEmail,
}: {
  invitationId: string;
  organizationName: string;
  inviterEmail: string;
}) {
  const searchParams = new URLSearchParams({
    organizationName,
    inviterEmail,
  });

  return `/onboarding/join/${encodeURIComponent(invitationId)}?${searchParams.toString()}`;
}

async function lookupInvitationPreview(invitationId: string) {
  try {
    const { data, error } = await auth.organization.getInvitation({
      query: { id: invitationId },
    });

    if (error || !data) {
      return {
        data: null,
        error: parseInvitationLookupError(error),
      };
    }

    const parsedPreview = invitationLookupSchema.safeParse(data);
    if (!parsedPreview.success) {
      return {
        data: null,
        error: "Unable to load invitation details.",
      };
    }

    return {
      data: parsedPreview.data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: parseInvitationLookupError(error),
    };
  }
}

function parseInvitationLookupError(error: unknown) {
  if (!error) {
    return "Unable to load invitation details.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const details = error as {
      code?: string;
      error?: string;
      error_description?: string;
      message?: string;
      statusText?: string;
    };

    const message =
      details.message ||
      details.error_description ||
      details.error ||
      details.statusText ||
      "Unable to load invitation details.";
    const normalizedCode = details.code?.toUpperCase();
    const normalizedMessage = message.toLowerCase();

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

    return message;
  }

  return "Unable to load invitation details.";
}
