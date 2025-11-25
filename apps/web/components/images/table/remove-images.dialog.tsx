"use client";

import type { Image } from "@containers/shared";
import { CornerDownLeftIcon, Trash2Icon } from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ContainersState } from "@/components/images/containers-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataTableContext } from "@/components/ui/data-table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { removeImagesAction } from "@/lib/actions/images.actions";
import { cn } from "@/lib/utils";

interface Props {
  images: Array<Image>;
}

export default function RemoveImagesDialog({ images }: Props) {
  const totalImages = images.length;
  const entityLabel = totalImages === 1 ? "image" : "images";

  const [state, action, isPending] = useActionState(removeImagesAction, {
    data: { images: [] },
    error: null,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const { table } = useDataTableContext<Image>();

  useEffect(() => {
    if (!hasSubmitted)
      return;

    if (isPending)
      return;

    if (state?.error?.root) {
      toast.error(state.error.root || "Unable to delete the selected images.");
      return;
    }

    if (
      state.error === null
      && Array.isArray(state.data?.images)
      && state.data.images.length > 0
    ) {
      toast.success(
        `Deleted ${state.data.images.length} Docker ${state.data.images.length === 1 ? "image" : "images"}.`,
      );

      startTransition(() => {
        setOpen(false);
        table.resetRowSelection();
      });
    }
  }, [state, isPending, hasSubmitted, table]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn(images.length === 0 && "hidden")}>
        <Button
          size="icon-sm"
          variant="destructive-ghost"
          aria-label={`Delete ${totalImages} selected images`}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form
          action={action}
          className="space-y-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          {images.map((image) => (
            <input key={image.id} type="hidden" name="images" value={image.id} />
          ))}

          <DialogHeader>
            <DialogTitle>
              {`Remove ${totalImages} ${entityLabel}?`}
            </DialogTitle>
            <DialogDescription>
              {`You are about to permanently remove ${totalImages} Docker ${entityLabel}. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <Item
                key={image.id}
                variant="outline"
                className="p-2 flex-nowrap"
              >
                <ItemContent>
                  <ItemTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="overflow-hidden text-ellipsis w-full max-w-32">
                          {image.repoTags.at(0) || "none"}
                        </span>
                      </TooltipTrigger>

                      <TooltipContent side="bottom">
                        {image.repoTags.join(" - ") || "none"}
                      </TooltipContent>
                    </Tooltip>
                  </ItemTitle>
                </ItemContent>

                <ItemActions>
                  <ContainersState state={image.containers} />
                </ItemActions>
              </Item>
            ))}
          </div>

          <FieldGroup>

            <FieldSeparator />

            <FieldSet>
              <FieldLabel htmlFor="force-delete">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Force remove</FieldTitle>
                    <FieldDescription>
                      Docker will stop and remove containers that still use the selected images.
                    </FieldDescription>
                  </FieldContent>

                  <Checkbox
                    id="force-delete"
                    name="force"
                    aria-label="Force delete selected images"
                  />
                </Field>
              </FieldLabel>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" size="sm" type="button">
                Cancel
                <KbdGroup>
                  <Kbd>ESC</Kbd>
                </KbdGroup>
              </Button>
            </DialogClose>

            <Button size="sm" variant="destructive" type="submit" disabled={isPending}>
              {`Delete ${entityLabel}`}
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
