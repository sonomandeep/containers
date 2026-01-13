"use client";

import { type LoginSchemaInput, loginSchema } from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const form = useForm<LoginSchemaInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function handleSubmit(data: LoginSchemaInput) {
    // Do something with the form values.
    console.log(data);
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
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                id={field.name}
                placeholder="••••••••••••"
                type="password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="flex w-full flex-col gap-3">
        <Button className="w-full" type="submit">
          Login
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
