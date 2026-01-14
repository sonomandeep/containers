"use client";

import {
  type ForgotPasswordSchemaInput,
  forgotPasswordSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const form = useForm<ForgotPasswordSchemaInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function handleSubmit(data: ForgotPasswordSchemaInput) {
    void data;
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={form.control}
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
      </div>

      <Button className="w-full" type="submit">
        Send reset link
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </Button>
    </form>
  );
}
