"use client";

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
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
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

export function PullImageDialog() {
  const [registry, setRegistry] = useState(REGISTRIES.at(0));
  const [state, action, isPending] = useActionState(pullImageAction, {
    data: {
      name: "",
      registry: "",
      tag: "latest",
    },
    error: null,
  });
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
                <FieldLabel htmlFor="registry">
                  Registry
                </FieldLabel>

                <Select
                  defaultValue={state.data.registry as string}
                  name="registry"
                  value={registry.host}
                  onValueChange={(value) =>
                    setRegistry(
                      REGISTRIES.find((current) => current.host === value),
                    )}
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
              </Field>

              <div className="grid grid-cols-[1fr_128px] gap-2">
                <Field data-invalid={!!state?.error?.name}>
                  <FieldLabel htmlFor="tag">Image Name</FieldLabel>

                  <Input
                    id="name"
                    name="name"
                    defaultValue={state.data.name as string}
                    placeholder="nginx"
                    aria-invalid={!!state?.error?.name}
                  />

                  {state?.error?.name && (
                    <FieldError>{state.error.name}</FieldError>
                  )}
                </Field>

                <Field data-invalid={!!state?.error?.tag}>
                  <FieldLabel htmlFor="tag">Tag</FieldLabel>

                  <Input
                    id="tag"
                    name="tag"
                    defaultValue={state.data.tag as string}
                    placeholder="latest"
                    autoComplete="off"
                    aria-invalid={!!state?.error?.tag}
                  />

                  {state?.error?.tag && (
                    <FieldError>{state.error.tag}</FieldError>
                  )}
                </Field>
              </div>
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
