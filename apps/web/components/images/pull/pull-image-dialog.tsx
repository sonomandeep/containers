"use client";

import type { Registry } from "@/lib/constants/registries";
import { DialogClose } from "@radix-ui/react-dialog";
import { CornerDownLeftIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { InfoCard, InfoCardRow } from "@/components/ui/info-card";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { pullImageAction } from "@/lib/actions/images.actions";
import REGISTRIES from "@/lib/constants/registries";

const DEFAULT_REGISTRY = REGISTRIES.at(0)!;

function getRegistryByHost(host?: string | null): Registry {
  return REGISTRIES.find((current) => current.host === host) ?? DEFAULT_REGISTRY;
}

export function PullImageDialog() {
  const [state, action, isPending] = useActionState(pullImageAction, {
    data: {
      name: "",
      registry: "",
      tag: "latest",
    },
    error: null,
  });
  const [registry, setRegistry] = useState<Registry>(() =>
    getRegistryByHost(state.data.registry as string | undefined),
  );
  const [imageName, setImageName] = useState(
    typeof state.data.name === "string" ? state.data.name : "",
  );
  const [tag, setTag] = useState(
    typeof state.data.tag === "string" ? state.data.tag : "latest",
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (!hasSubmitted)
      return;

    if (isPending)
      return;

    if (state?.error?.root) {
      toast.error(state.error.root || "An unexpected error occurred.");
      return;
    }

    if (state.error === null && Object.keys(state.data ?? {}).length > 0) {
      toast.success("Image pulled successfully.");
    }
  }, [state, isPending, hasSubmitted]);

  const imageReference = (() => {
    const trimmedName = imageName.trim();
    const trimmedTag = tag.trim();

    if (!trimmedName)
      return null;

    return `${registry.host}/${trimmedName}${trimmedTag ? `:${trimmedTag}` : ""}`;
  })();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          Pull Image
          <KbdGroup>
            <Kbd>
              <CornerDownLeftIcon />
            </Kbd>
          </KbdGroup>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull Docker Image</DialogTitle>
          <DialogDescription>
            Choose the registry and specify the image to download.
          </DialogDescription>
        </DialogHeader>

        <form
          action={action}
          className="flex flex-col gap-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field data-invalid={!!state?.error?.registry}>
                <FieldLabel htmlFor="registry">Registry</FieldLabel>

                <Select
                  name="registry"
                  value={registry.host}
                  onValueChange={(value) =>
                    setRegistry(getRegistryByHost(value))}
                >
                  <SelectTrigger
                    className=""
                    aria-invalid={!!state?.error?.registry}
                  >
                    {registry.label}
                  </SelectTrigger>

                  <SelectContent className="min-w-24">
                    {REGISTRIES.map((current) => (
                      <SelectItem key={current.host} value={current.host}>
                        {current.label}
                        <span className="text-muted-foreground">
                          {current.host}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {state?.error?.registry && (
                  <FieldError>{state.error.registry}</FieldError>
                )}

                <FieldDescription>
                  Where the image is hosted (e.g. Docker Hub, GHCR).
                </FieldDescription>
              </Field>

              <div className="grid grid-cols-[1fr_128px] gap-2">
                <Field data-invalid={!!state?.error?.name}>
                  <FieldLabel htmlFor="tag">Image Name</FieldLabel>

                  <Input
                    id="name"
                    name="name"
                    value={imageName}
                    onChange={(event) => setImageName(event.target.value)}
                    placeholder="nginx"
                    aria-invalid={!!state?.error?.name}
                  />

                  {state?.error?.name && (
                    <FieldError>{state.error.name}</FieldError>
                  )}

                  <FieldDescription>
                    Specify the image name and tag (e.g. nginx:1.25)
                  </FieldDescription>
                </Field>

                <Field data-invalid={!!state?.error?.tag}>
                  <FieldLabel htmlFor="tag">Tag</FieldLabel>

                  <Input
                    id="tag"
                    name="tag"
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
                    placeholder="latest"
                    autoComplete="off"
                    aria-invalid={!!state?.error?.tag}
                  />

                  {state?.error?.tag && (
                    <FieldError>{state.error.tag}</FieldError>
                  )}
                </Field>
              </div>

              {imageReference && (
                <>
                  <FieldSeparator></FieldSeparator>

                  <InfoCard>
                    <InfoCardRow label="Image reference"><span className="font-mono">{imageReference}</span></InfoCardRow>
                  </InfoCard>
                </>
              )}
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <ButtonGroup>
              <DialogClose asChild>
                <Button size="sm" variant="secondary" type="button">
                  Cancel
                  <KbdGroup>
                    <Kbd>ESC</Kbd>
                  </KbdGroup>
                </Button>
              </DialogClose>
            </ButtonGroup>

            <Button size="sm" type="submit" disabled={isPending}>
              Pull Image
              {isPending
                ? (
                    <Spinner />
                  )
                : (
                    <KbdGroup>
                      <Kbd>
                        <CornerDownLeftIcon />
                      </Kbd>
                    </KbdGroup>
                  )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
