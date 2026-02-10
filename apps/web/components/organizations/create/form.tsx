"use client";

import { CornerDownLeftIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";

type CreateOrganizationFormInput = {
  name: string;
  handle: string;
};

export function CreateOrganizationForm() {
  const form = useForm<CreateOrganizationFormInput>({
    defaultValues: {
      name: "",
      handle: "",
    },
  });

  function handleSubmit(input: CreateOrganizationFormInput) {
    form.reset(input);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-3">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Workspace name</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="organization"
                id={field.name}
                placeholder="Acme"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="handle"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Handle</FieldLabel>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>paper.mando.sh/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="pl-0!"
                  id={field.name}
                  placeholder="acme"
                  spellCheck={false}
                  type="text"
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Button className="w-full" type="submit">
        Continue
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </Button>
    </form>
  );
}
