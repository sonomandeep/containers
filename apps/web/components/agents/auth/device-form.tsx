"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BadgeCheck,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

const deviceVerificationSchema = z.object({
  userCode: z.string().trim().min(1, "Enter the code from your terminal."),
});

type DeviceVerificationInput = z.infer<typeof deviceVerificationSchema>;

type ActionState = "approve" | "deny" | null;

type ResultState = "idle" | "approved" | "denied";

type Props = {
  callbackUrl: string;
  userCode: string;
};

export function DeviceVerificationForm({ callbackUrl, userCode }: Props) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = auth.useSession();
  const [action, setAction] = useState<ActionState>(null);
  const [result, setResult] = useState<ResultState>("idle");
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<DeviceVerificationInput>({
    resolver: zodResolver(deviceVerificationSchema),
    defaultValues: {
      userCode,
    },
  });

  useEffect(() => {
    if (!userCode) {
      return;
    }

    form.setValue("userCode", userCode, { shouldValidate: true });
  }, [form, userCode]);

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    if (!session) {
      router.replace(
        `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      );
    }
  }, [isSessionPending, callbackUrl, router, session]);

  const isBusy = action !== null;
  const isDone = result !== "idle";

  const handleApprove = form.handleSubmit(async (input) => {
    setAction("approve");
    setRequestError(null);

    const code = normalizeUserCode(input.userCode);
    if (!code) {
      form.setError("userCode", {
        message: "Enter the code from your terminal.",
      });
      setAction(null);
      return;
    }

    const { error } = await auth.device.approve({ userCode: code });
    if (error) {
      setRequestError(formatDeviceError(error));
      setAction(null);
      return;
    }

    setResult("approved");
    setAction(null);
  });

  const handleDeny = async () => {
    const isValid = await form.trigger("userCode");
    if (!isValid) {
      return;
    }

    setAction("deny");
    setRequestError(null);

    const code = normalizeUserCode(form.getValues("userCode"));
    if (!code) {
      form.setError("userCode", {
        message: "Enter the code from your terminal.",
      });
      setAction(null);
      return;
    }

    const { error } = await auth.device.deny({ userCode: code });
    if (error) {
      setRequestError(formatDeviceError(error));
      setAction(null);
      return;
    }

    setResult("denied");
    setAction(null);
  };

  if (isSessionPending) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Spinner className="size-3" />
        Checking your session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-muted-foreground text-xs">
        Redirecting to login...
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleApprove}>
      <div className="flex flex-col gap-3">
        <Field data-invalid={form.formState.errors.userCode ? true : undefined}>
          <FieldLabel htmlFor="userCode">Device code</FieldLabel>
          <Input
            aria-invalid={!!form.formState.errors.userCode}
            autoCapitalize="characters"
            autoComplete="one-time-code"
            disabled={isBusy || isDone}
            id="userCode"
            placeholder="NNTV-BFAA"
            {...form.register("userCode")}
          />
          <FieldDescription>
            Enter the code shown in your terminal.
          </FieldDescription>
          {form.formState.errors.userCode && (
            <FieldError errors={[form.formState.errors.userCode]} />
          )}
        </Field>

        {requestError && (
          <Alert variant="destructive">
            <div className="inline-flex items-center gap-2">
              <AlertCircleIcon className="size-3" />
              <AlertTitle>{requestError}</AlertTitle>
            </div>
          </Alert>
        )}

        {result === "approved" && (
          <Alert variant="info">
            <div className="inline-flex items-center gap-2">
              <BadgeCheck className="size-3" />
              <AlertTitle>Device approved</AlertTitle>
            </div>
          </Alert>
        )}

        {result === "denied" && (
          <Alert variant="destructive">
            <div className="inline-flex items-center gap-2">
              <AlertTriangleIcon className="size-3" />
              <AlertTitle>Device denied</AlertTitle>
            </div>
          </Alert>
        )}
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          className="w-full"
          disabled={isBusy || isDone}
          onClick={handleDeny}
          type="button"
          variant="secondary"
        >
          Deny
          {action === "deny" ? (
            <Spinner className="size-3 opacity-60" />
          ) : (
            <XIcon className="size-3 opacity-60" />
          )}
        </Button>

        <Button className="w-full" disabled={isBusy || isDone} type="submit">
          Authorize
          {action === "approve" ? (
            <Spinner className="size-3 opacity-60" />
          ) : (
            <CheckIcon className="size-3 opacity-60" />
          )}
        </Button>
      </div>
    </form>
  );
}

function normalizeUserCode(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

function formatDeviceError(error: unknown) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object") {
    const details = error as {
      error_description?: string;
      message?: string;
      error?: string;
      statusText?: string;
    };

    return (
      details.error_description ||
      details.message ||
      details.error ||
      details.statusText ||
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}
