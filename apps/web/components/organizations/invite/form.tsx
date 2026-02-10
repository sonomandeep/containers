"use client";

import { CornerDownLeftIcon, PlusIcon, XIcon } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

type InviteMembersFormInput = {
  invites: Array<{
    email: string;
  }>;
};

const EMPTY_INVITE = { email: "" };

export function InviteMembersForm() {
  const form = useForm<InviteMembersFormInput>({
    defaultValues: {
      invites: [EMPTY_INVITE],
    },
  });
  const invites = useFieldArray({
    control: form.control,
    name: "invites",
  });

  function handleSubmit(input: InviteMembersFormInput) {
    form.reset(input);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex flex-col gap-2">
        {invites.fields.map((invite, index) => (
          <div key={invite.id}>
            <Controller
              control={form.control}
              name={`invites.${index}.email` as const}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    className={index > 0 ? "sr-only" : undefined}
                    htmlFor={field.name}
                  >
                    Email address
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      id={field.name}
                      inputMode="email"
                      placeholder="hello@mando.sh"
                      type="email"
                    />

                    {invites.fields.length > 1 && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Remove teammate email"
                          className="transition-opacity md:pointer-events-none md:opacity-0 md:group-hover/input-group:pointer-events-auto md:group-hover/input-group:opacity-100 md:group-focus-within/input-group:pointer-events-auto md:group-focus-within/input-group:opacity-100 [&>svg]:opacity-60"
                          onClick={() => invites.remove(index)}
                          size="icon-xs"
                          type="button"
                        >
                          <XIcon />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        ))}

        <Button
          className="border-dashed text-muted-foreground"
          onClick={() => invites.append({ ...EMPTY_INVITE })}
          type="button"
          variant="outline"
        >
          <PlusIcon className="opacity-60" />
          Add member
        </Button>
      </div>

      <Button className="w-full" type="submit">
        Send invites
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </Button>
    </form>
  );
}
