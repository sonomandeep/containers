"use client";

import { CornerDownLeftIcon, RotateCcwIcon } from "lucide-react";
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
  InputGroupText,
} from "@/components/ui/input-group";
import { toSlug } from "@/lib/utils";

type CreateOrganizationFormInput = {
  name: string;
  handle: string;
};

export function CreateOrganizationForm() {
  const [isHandleAutoSync, setIsHandleAutoSync] = useState(true);
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
                onChange={(event) => {
                  const nextName = event.target.value;
                  field.onChange(nextName);

                  if (!isHandleAutoSync) {
                    return;
                  }

                  form.setValue("handle", toSlug(nextName), {
                    shouldDirty: false,
                    shouldTouch: false,
                  });
                }}
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
                  onChange={(event) => {
                    if (isHandleAutoSync) {
                      setIsHandleAutoSync(false);
                    }

                    field.onChange(toSlug(event.target.value));
                  }}
                  placeholder="acme"
                  spellCheck={false}
                  type="text"
                />

                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    aria-hidden={isHandleAutoSync}
                    aria-label="Regenerate handle from workspace name"
                    className={`transition-opacity ${
                      isHandleAutoSync
                        ? "pointer-events-none opacity-0!"
                        : "opacity-100"
                    }`}
                    disabled={isHandleAutoSync}
                    onClick={() => {
                      const workspaceName = form.getValues("name");
                      form.setValue("handle", toSlug(workspaceName));
                      setIsHandleAutoSync(true);
                    }}
                    size="icon-xs"
                    tabIndex={isHandleAutoSync ? -1 : 0}
                    type="button"
                  >
                    <RotateCcwIcon className="size-3" />
                  </InputGroupButton>
                </InputGroupAddon>
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
