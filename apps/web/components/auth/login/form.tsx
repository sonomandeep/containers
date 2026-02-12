"use client";

import { type LoginSchemaInput, loginSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CornerDownLeftIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function LoginForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const form = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleSubmit(input: LoginSchemaInput) {
    auth.signIn.email(input, {
      onRequest: () => {
        setIsPending(true);
        setIsEmailNotVerified(false);
      },
      onResponse: () => {
        setIsPending(false);
      },
      onSuccess: () => {
        router.replace("/");
      },
      onError: ({ error }) => {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          return setIsEmailNotVerified(true);
        }

        form.setError("root", { message: error.message });
      },
    });
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-3">
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
              <div className="flex items-center">
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Link
                  className="ml-auto inline-block text-xs hover:underline"
                  href="/auth/forgot-password"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="current-password"
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

        {form.formState.errors.root && (
          <FieldError errors={[form.formState.errors.root]} />
        )}

        {isEmailNotVerified && (
          <Alert variant="destructive">
            <div className="inline-flex items-center gap-2">
              <AlertCircleIcon className="size-3" />
              <AlertTitle>Email not verified. Check your inbox.</AlertTitle>
            </div>
          </Alert>
        )}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button className="w-full" disabled={isPending} type="submit">
          Login
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
            Sign In With Github
          </Button>

          <Button className="w-full" variant="secondary">
            <Image
              alt="Google"
              height={20}
              src="/logos/google_light.png"
              width={20}
            />
            Sign In With Google
          </Button>
        </div>
      </div>
    </form>
  );
}
