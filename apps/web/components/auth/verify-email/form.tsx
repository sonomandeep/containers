"use client";

import {
  type VerifyEmailSchemaInput,
  verifyEmailSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CornerDownLeftIcon } from "lucide-react";

export function VerifyEmailForm() {
  const form = useForm<VerifyEmailSchemaInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  function handleSubmit(data: VerifyEmailSchemaInput) {
    // Do something with the form values.
    console.log(data);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <Controller
        control={form.control}
        name="code"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className="flex justify-center">
              <InputOTP
                aria-invalid={fieldState.invalid}
                aria-label="Verification code"
                className="w-full"
                containerClassName="w-full gap-3 justify-between"
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

      <Button className="w-full" type="submit">
        Verify
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </Button>
    </form>
  );
}
