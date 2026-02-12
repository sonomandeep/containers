"use client";

import {
  type InviteMembersInput,
  inviteMembersSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CornerDownLeftIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Controller,
  type UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";

const EMPTY_INVITE: InviteMembersInput["invites"][number] = { email: "" };
const INVITE_MEMBER_ROLE = "member";
const FALLBACK_INVITE_ERROR_MESSAGE =
  "Unable to send invitations right now. Please try again.";

type FailedInvite = {
  email: string;
  message: string | null;
};

type InviteErrorDetails = {
  code: string | null;
  message: string;
};

type InviteAttemptResult = {
  failedInvite: FailedInvite | null;
  rootErrorMessage: string | null;
  sent: boolean;
};

type InviteSubmissionResult = {
  failedInvites: Array<FailedInvite>;
  rootErrorMessage: string | null;
  sentInvitesCount: number;
};

type InviteMembersFormProps = {
  workspaceSlug: string;
};

export function InviteMembersForm({ workspaceSlug }: InviteMembersFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [partialSuccessMessage, setPartialSuccessMessage] = useState<
    string | null
  >(null);
  const form = useForm<InviteMembersInput>({
    resolver: zodResolver(inviteMembersSchema),
    defaultValues: {
      invites: [EMPTY_INVITE],
    },
  });
  const invites = useFieldArray({
    control: form.control,
    name: "invites",
  });

  async function handleSubmit(input: InviteMembersInput) {
    setIsPending(true);
    setPartialSuccessMessage(null);
    form.clearErrors();

    const submissionResult = await processInviteSubmission(input.invites);

    if (submissionResult.failedInvites.length === 0) {
      setIsPending(false);
      router.replace(`/${workspaceSlug}/containers`);
      return;
    }

    applyFailedInviteErrors(
      form,
      submissionResult.failedInvites,
      submissionResult.rootErrorMessage
    );

    if (submissionResult.sentInvitesCount > 0) {
      setPartialSuccessMessage(
        buildPartialSuccessMessage(submissionResult.sentInvitesCount)
      );
    }

    setIsPending(false);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-2">
        {invites.fields.map((invite, index) => (
          <div key={invite.id}>
            <Controller
              control={form.control}
              disabled={isPending}
              name={`invites.${index}.email` as const}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className={index > 0 ? "sr-only" : undefined}
                    htmlFor={field.name}
                  >
                    Email address
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      id={field.name}
                      inputMode="email"
                      placeholder="hello@mando.sh"
                      type="email"
                    />

                    {invites.fields.length > 1 && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Remove teammate email"
                          className="transition-opacity md:pointer-events-none md:opacity-0 md:group-hover/input-group:pointer-events-auto md:group-hover/input-group:opacity-100 md:group-focus-within/input-group:pointer-events-auto md:group-focus-within/input-group:opacity-100 [&>svg]:opacity-60"
                          disabled={isPending}
                          onClick={() => invites.remove(index)}
                          size="icon-xs"
                          type="button"
                        >
                          <XIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        ))}

        <Button
          className="border-dashed text-muted-foreground"
          disabled={isPending}
          onClick={() => invites.append({ ...EMPTY_INVITE })}
          type="button"
          variant="outline"
        >
          <PlusIcon className="opacity-60" />
          Add member
        </Button>
      </div>

      {partialSuccessMessage && (
        <Alert variant="info">
          <AlertTitle>{partialSuccessMessage}</AlertTitle>
        </Alert>
      )}

      {form.formState.errors.root && (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertCircleIcon className="size-3" />
            <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
          </div>
        </Alert>
      )}

      <Button className="w-full" disabled={isPending} type="submit">
        Send invites
        {isPending ? (
          <Spinner className="size-3 opacity-60" />
        ) : (
          <CornerDownLeftIcon className="size-3 opacity-60" />
        )}
      </Button>
    </form>
  );
}

function parseInviteError(error: unknown): InviteErrorDetails {
  if (!error) {
    return {
      code: null,
      message: FALLBACK_INVITE_ERROR_MESSAGE,
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
        FALLBACK_INVITE_ERROR_MESSAGE,
    };
  }

  return {
    code: null,
    message: FALLBACK_INVITE_ERROR_MESSAGE,
  };
}

async function processInviteSubmission(
  invites: InviteMembersInput["invites"]
): Promise<InviteSubmissionResult> {
  const failedInvites: Array<FailedInvite> = [];
  let sentInvitesCount = 0;
  let rootErrorMessage: string | null = null;

  for (const invite of invites) {
    const attemptResult = await sendMemberInvite(invite.email);

    if (attemptResult.sent) {
      sentInvitesCount += 1;
      continue;
    }

    if (attemptResult.failedInvite) {
      failedInvites.push(attemptResult.failedInvite);
    }

    if (!rootErrorMessage && attemptResult.rootErrorMessage) {
      rootErrorMessage = attemptResult.rootErrorMessage;
    }
  }

  return {
    failedInvites,
    sentInvitesCount,
    rootErrorMessage,
  };
}

function applyFailedInviteErrors(
  form: UseFormReturn<InviteMembersInput>,
  failedInvites: Array<FailedInvite>,
  rootErrorMessage: string | null
) {
  form.reset({
    invites: failedInvites.map((invite) => ({ email: invite.email })),
  });

  for (const [index, invite] of failedInvites.entries()) {
    if (!invite.message) {
      continue;
    }

    form.setError(`invites.${index}.email` as const, {
      message: invite.message,
    });
  }

  if (rootErrorMessage) {
    form.setError("root", { message: rootErrorMessage });
  }
}

async function sendMemberInvite(email: string): Promise<InviteAttemptResult> {
  try {
    const { error } = await auth.organization.inviteMember({
      email,
      role: INVITE_MEMBER_ROLE,
    });

    if (!error) {
      return {
        sent: true,
        failedInvite: null,
        rootErrorMessage: null,
      };
    }

    const details = parseInviteError(error);
    const fieldMessage = getInviteFieldErrorMessage(details);

    return {
      sent: false,
      failedInvite: {
        email,
        message: fieldMessage,
      },
      rootErrorMessage: fieldMessage ? null : details.message,
    };
  } catch (error) {
    const details = parseInviteError(error);

    return {
      sent: false,
      failedInvite: {
        email,
        message: null,
      },
      rootErrorMessage: details.message,
    };
  }
}

function buildPartialSuccessMessage(sentInvitesCount: number) {
  const inviteWord = sentInvitesCount === 1 ? "invitation" : "invitations";
  return `${sentInvitesCount} ${inviteWord} sent. Fix the remaining email addresses and try again.`;
}

function getInviteFieldErrorMessage(error: InviteErrorDetails) {
  const normalizedCode = error.code?.toUpperCase();
  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedCode === "USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION" ||
    normalizedMessage.includes("already invited")
  ) {
    return "This user is already invited";
  }

  if (
    normalizedCode === "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION" ||
    normalizedMessage.includes("already a member")
  ) {
    return "This user is already a member";
  }

  if (
    normalizedCode === "INVALID_EMAIL" ||
    normalizedMessage.includes("invalid email")
  ) {
    return "Please enter a valid email address";
  }

  return null;
}
