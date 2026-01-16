"use client";

import { type SignupSchemaInput, signupSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { BASE_ERROR_CODES } from "better-auth";
import { CornerDownLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";

export function SignupForm() {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const form = useForm<SignupSchemaInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function handleSubmit(input: SignupSchemaInput) {
    auth.signUp.email(
      {
        email: input.email,
        name: `${input.firstName} ${input.lastName}`,
        password: input.password,
      },
      {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onSuccess: () => {
          setShowSuccessAlert(true);
        },
        onError: ({ error }) => {
          if (
            error.message ===
            BASE_ERROR_CODES.USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL
          ) {
            return form.setError("email", { message: error.message });
          }

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
      <div className="flex flex-col gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <Controller
            control={form.control}
            disabled={isPending}
            name="firstName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>First Name</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="given-name"
                  id={field.name}
                  placeholder="Mando"
                  type="text"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={form.control}
            disabled={isPending}
            name="lastName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Last Name</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="family-name"
                  id={field.name}
                  placeholder="SH"
                  type="text"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

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
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                    tabIndex={-1}
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
          disabled={isPending}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
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
                    tabIndex={-1}
                    type="button"
                  >
                    {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}

        {showSuccessAlert && (
          <Alert variant="info">
            <AlertTitle>
              We’ve sent you a verification email. Click the link to verify your
              account.
            </AlertTitle>
          </Alert>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button className="w-full" disabled={isPending} type="submit">
          Sign Up
          {isPending ? (
            <Spinner className="size-3 opacity-60" />
          ) : (
            <CornerDownLeftIcon className="size-3 opacity-60" />
          )}
        </Button>

        <div className="flex w-full flex-col gap-1">
          <Button className="w-full gap-1.5" variant="secondary">
            <Image
              alt="Github"
              height={12}
              src="/logos/github_light.png"
              width={12}
            />
            Sign Up With Github
          </Button>

          <Button className="w-full" variant="secondary">
            <Image
              alt="Google"
              height={20}
              src="/logos/google_light.png"
              width={20}
            />
            Sign Up With Google
          </Button>
        </div>
      </div>
    </form>
  );
}
