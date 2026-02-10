"use client";

import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  CornerDownLeftIcon,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type JoinTeamFormProps = {
  initialInvitationId?: string;
};

type JoinTeamFormInput = {
  invitationId: string;
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

function buildInvitationPreview(invitationId: string) {
  const suffix = invitationId.slice(-4).toLowerCase() || "team";

  return {
    workspaceName: "Paper Workspace",
    invitedBy: `owner+${suffix}@mando.sh`,
    invitedEmail: `member+${suffix}@mando.sh`,
    role: "Member",
  };
}

export function JoinTeamForm({ initialInvitationId }: JoinTeamFormProps) {
  const normalizedInvitationId = normalizeInvitationId(
    initialInvitationId ?? ""
  );
  const [activeInvitationId, setActiveInvitationId] = useState(
    normalizedInvitationId
  );
  const [decision, setDecision] = useState<InvitationDecision>("idle");
  const form = useForm<JoinTeamFormInput>({
    defaultValues: {
      invitationId: normalizedInvitationId,
    },
  });

  const invitationPreview = buildInvitationPreview(activeInvitationId);

  function handleContinue(input: JoinTeamFormInput) {
    const invitationId = normalizeInvitationId(input.invitationId);

    if (!invitationId) {
      form.setError("invitationId", {
        message: "Invitation ID is required.",
      });
      return;
    }

    if (isInviteLink(invitationId)) {
      form.setError("invitationId", {
        message: "Enter the invitation ID only.",
      });
      return;
    }

    form.clearErrors("invitationId");
    form.setValue("invitationId", invitationId, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setActiveInvitationId(invitationId);
    setDecision("idle");
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleContinue)}
    >
      {activeInvitationId ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-md border border-card-border bg-card p-3">
            <p className="font-medium text-xs/relaxed">Invitation details</p>

            <dl className="mt-2 grid gap-1 text-xs/relaxed">
              <div className="inline-flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Workspace</dt>
                <dd>{invitationPreview.workspaceName}</dd>
              </div>

              <div className="inline-flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Invited by</dt>
                <dd>{invitationPreview.invitedBy}</dd>
              </div>

              <div className="inline-flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd>{invitationPreview.invitedEmail}</dd>
              </div>

              <div className="inline-flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Role</dt>
                <dd>{invitationPreview.role}</dd>
              </div>
            </dl>
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
      ) : (
        <>
          <Controller
            control={form.control}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Button className="w-full" type="submit">
            Continue
            <CornerDownLeftIcon className="size-3 opacity-60" />
          </Button>
        </>
      )}
    </form>
  );
}
