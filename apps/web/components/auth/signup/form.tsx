"use client";

import { type SignupSchemaInput, signupSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { CornerDownLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function SignupForm() {
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

  function handleSubmit(data: SignupSchemaInput) {
    // Do something with the form values.
    console.log(data);
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
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="email"
                id={field.name}
                placeholder="hello@mando.sh"
                type="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
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
                    onClick={() =>
                      setIsConfirmPasswordVisible((value) => !value)
                    }
                    size="icon-xs"
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
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button className="w-full" type="submit">
          Sign Up
          <CornerDownLeftIcon className="size-3 opacity-60" />
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
