"use client";

import { DialogClose } from "@radix-ui/react-dialog";
import { CornerDownLeftIcon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
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
      tag: "",
    },
    error: null,
  });

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
            Select the registry, image name and tag to pull.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name">Image (Registry and Image name)</FieldLabel>

                <ButtonGroup className="w-full">
                  <Select defaultValue={state.data.registry as string} name="registry" value={registry.host} onValueChange={(value) => setRegistry(REGISTRIES.find((current) => current.host === value))}>
                    <SelectTrigger className="font-mono w-40">{registry.label}</SelectTrigger>

                    <SelectContent className="min-w-24">
                      {REGISTRIES.map((current) => (
                        <SelectItem key={current.host} value={current.host}>
                          {current.label}
                          <span className="text-muted-foreground">{current.host}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input id="name" name="name" defaultValue={state.data.name as string} placeholder="nginx" />
                </ButtonGroup>

                {state?.error?.registry && (
                  <FieldError>{state.error.registry}</FieldError>
                )}
                {state?.error?.name && (
                  <FieldError>{state.error.name}</FieldError>
                )}

                <FieldDescription>
                  Use the full image name as on the registry.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="tag">Image Tag</FieldLabel>
                <Input id="tag" name="tag" defaultValue={state.data.tag as string} placeholder="latest" autoComplete="off" />

                {state?.error?.tag && (
                  <FieldError>{state.error.tag}</FieldError>
                )}

                <FieldDescription>
                  Specify the image tag (e.g. latest, 1.28).
                </FieldDescription>
              </Field>
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
                ? (<Spinner />)
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
