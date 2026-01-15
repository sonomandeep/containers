"use client";

import {
  type VerifyEmailSchemaInput,
  verifyEmailSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";

export function VerifyEmailForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<VerifyEmailSchemaInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: "",
      code: "",
    },
  });

  function handleSubmit(input: VerifyEmailSchemaInput) {
    auth.emailOtp.verifyEmail(
      { email: input.email, otp: input.code },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onSuccess: () => {
          router.replace("/containers");
        },
        onError: ({ error }) => {
          form.setError("root", { message: error.message });
        },
      }
    );
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Controller
        control={form.control}
        disabled={isPending}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
            <Input
              {...field}
              aria-invalid={fieldState.invalid}
              autoComplete="email"
              id={field.name}
              inputMode="email"
              placeholder="hello@mando.sh"
              type="email"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        disabled={isPending}
        name="code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>OTP Code</FieldLabel>
            <div className="flex justify-center">
              <InputOTP
                aria-invalid={fieldState.invalid}
                aria-label="Verification code"
                autoComplete="one-time-code"
                className="w-full"
                containerClassName="w-full gap-3 justify-between"
                disabled={isPending}
                inputMode="numeric"
                maxLength={6}
                onChange={field.onChange}
                value={field.value}
              >
                <InputOTPGroup className="flex-1 justify-between">
                  <InputOTPSlot className="flex-1 text-sm" index={0} />
                  <InputOTPSlot className="flex-1 text-sm" index={1} />
                  <InputOTPSlot className="flex-1 text-sm" index={2} />
                </InputOTPGroup>

                <InputOTPSeparator />

                <InputOTPGroup className="flex-1 justify-between">
                  <InputOTPSlot className="flex-1 text-sm" index={3} />
                  <InputOTPSlot className="flex-1 text-sm" index={4} />
                  <InputOTPSlot className="flex-1 text-sm" index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button className="w-full" disabled={isPending} type="submit">
        Verify
        {isPending ? (
          <Spinner className="size-3 opacity-60" />
        ) : (
          <CornerDownLeftIcon className="size-3 opacity-60" />
        )}
      </Button>
    </form>
  );
}
