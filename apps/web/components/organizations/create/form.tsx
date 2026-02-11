"use client";

import {
  type CreateOrganizationInput,
  createOrganizationSchema,
} from "@containers/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CornerDownLeftIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { auth } from "@/lib/auth";
import { removeLogo, uploadLogo } from "@/lib/services/organizations.service";
import { cn, toSlug } from "@/lib/utils";

const ACCEPTED_LOGO_FORMATS = "image/png,image/jpeg,image/webp";

export function CreateOrganizationForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isHandleAutoSync, setIsHandleAutoSync] = useState(true);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const form = useForm<CreateOrganizationInput>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: undefined,
    },
  });

  const logo = form.watch("logo");
  const name = form.watch("name");

  useEffect(() => {
    if (!(logo instanceof File)) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logo);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logo]);

  async function handleSubmit(input: CreateOrganizationInput) {
    form.clearErrors();
    setIsPending(true);

    let uploadedLogoId: string | undefined;
    let logoUrl: string | undefined;
    if (input.logo instanceof File) {
      const uploadedLogo = await uploadLogo(input.logo);
      if (uploadedLogo.error || !uploadedLogo.data) {
        form.setError("root", {
          message:
            uploadedLogo.error || "Unexpected error while uploading logo.",
        });
        setIsPending(false);
        return;
      }

      uploadedLogoId = uploadedLogo.data.id;
      logoUrl = uploadedLogo.data.url;
    }

    auth.organization.create(
      {
        name: input.name,
        slug: input.slug,
        ...(logoUrl ? { logo: logoUrl } : {}),
      },
      {
        onResponse: () => {
          setIsPending(false);
        },
        onSuccess: () => {
          router.replace("/onboarding/invite");
        },
        onError: ({ error }) => {
          if (uploadedLogoId) {
            removeLogo(uploadedLogoId).catch((cleanupError) => cleanupError);
          }

          if (error.code === "ORGANIZATION_ALREADY_EXISTS") {
            form.setError("slug", {
              message: "Workspace handle is already taken",
            });
            return;
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
        <Controller
          control={form.control}
          disabled={isPending}
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

                  form.setValue("slug", toSlug(nextName), {
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
          disabled={isPending}
          name="slug"
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
                      form.setValue("slug", toSlug(workspaceName));
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
          disabled={isPending}
          name="logo"
          render={({ field, fieldState }) => (
            <Field className="pt-1" data-invalid={fieldState.invalid}>
              <Input
                accept={ACCEPTED_LOGO_FORMATS}
                className="sr-only"
                disabled={isPending}
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
                  className={cn(
                    "absolute inset-0 z-10 h-full w-full rounded-md",
                    !isPending && "cursor-pointer"
                  )}
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

      {form.formState.errors.root && (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertCircleIcon className="size-3" />
            <AlertTitle>{form.formState.errors.root.message}</AlertTitle>
          </div>
        </Alert>
      )}

      <Button className="w-full" disabled={isPending} type="submit">
        Continue
        {isPending ? (
          <Spinner className="size-3 opacity-60" />
        ) : (
          <CornerDownLeftIcon className="size-3 opacity-60" />
        )}
      </Button>
    </form>
  );
}
