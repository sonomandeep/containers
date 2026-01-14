"use client";

import {
  type ResetPasswordSchemaInput,
  resetPasswordSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function ResetPasswordForm() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const form = useForm<ResetPasswordSchemaInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function handleSubmit(data: ResetPasswordSchemaInput) {
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
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  id={field.name}
                  placeholder="••••••••••••"
                  type={isPasswordVisible ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    className="[&>svg]:opacity-60"
                    onClick={() => setIsPasswordVisible((value) => !value)}
                    size="icon-xs"
                    type="button"
                  >
                    {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Confirm New Password
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="new-password"
                  id={field.name}
                  placeholder="••••••••••••"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-label={
                      isConfirmPasswordVisible
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    className="[&>svg]:opacity-60"
                    onClick={() =>
                      setIsConfirmPasswordVisible((value) => !value)
                    }
                    size="icon-xs"
                    type="button"
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOffIcon />
                    ) : (
                      <EyeIcon />
                    )}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Button className="w-full" type="submit">
        Reset password
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </Button>
    </form>
  );
}
