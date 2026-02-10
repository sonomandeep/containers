"use client";

import { CornerDownLeftIcon, RotateCcwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
  logo: File | null;
  name: string;
  handle: string;
};

const ACCEPTED_LOGO_FORMATS = "image/png,image/jpeg,image/webp";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [isHandleAutoSync, setIsHandleAutoSync] = useState(true);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const form = useForm<CreateOrganizationFormInput>({
    defaultValues: {
      logo: null,
      name: "",
      handle: "",
    },
  });

  const logo = form.watch("logo");
  const name = form.watch("name");

  useEffect(() => {
    if (!logo) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logo);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logo]);

  function handleSubmit(_input: CreateOrganizationFormInput) {
    router.push("/onboarding/invite");
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

        <Controller
          control={form.control}
          name="logo"
          render={({ field, fieldState }) => (
            <Field className="pt-1" data-invalid={fieldState.invalid}>
              <Input
                accept={ACCEPTED_LOGO_FORMATS}
                className="sr-only"
                id={field.name}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  field.onChange(file);
                }}
                ref={field.ref}
                type="file"
              />

              <div className="relative flex w-full items-center gap-3 rounded-md">
                <FieldLabel
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer rounded-md"
                  htmlFor={field.name}
                >
                  <span className="sr-only">Upload workspace logo</span>
                </FieldLabel>

                <Avatar className="size-8 after:rounded-md">
                  {logoPreviewUrl ? (
                    <AvatarImage
                      alt="Workspace logo preview"
                      className="rounded-md"
                      src={logoPreviewUrl}
                    />
                  ) : (
                    <AvatarFallback className="rounded-md font-medium font-mono uppercase">
                      {name?.charAt(0) || "A"}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex flex-col">
                  <FieldLabel
                    className="pointer-events-none w-fit"
                    htmlFor={field.name}
                  >
                    Workspace logo
                  </FieldLabel>
                  <FieldDescription className="pointer-events-none m-0">
                    Accepted: PNG, JPG, WEBP. Max 2MB.
                  </FieldDescription>
                </div>
              </div>

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
