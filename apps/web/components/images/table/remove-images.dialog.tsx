"use client";

import type { Image } from "@containers/shared";
import { CornerDownLeftIcon, Trash2Icon } from "lucide-react";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { ContainersState } from "@/components/images/containers-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDataTableContext } from "@/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
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

type Props = {
  images: Array<Image>;
};

export default function RemoveImagesDialog({ images }: Props) {
  const totalImages = images.length;
  const entityLabel = totalImages === 1 ? "image" : "images";

  const [state, action, isPending] = useActionState(removeImagesAction, {
    data: { images: [] },
    error: null,
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const { table } = useDataTableContext<Image>();

  useEffect(() => {
    if (!hasSubmitted) {
      return;
    }

    if (isPending) {
      return;
    }

    if (state?.error?.root) {
      toast.error(state.error.root || "Unable to delete the selected images.");
      return;
    }

    if (
      state.error === null &&
      Array.isArray(state.data?.images) &&
      state.data.images.length > 0
    ) {
      toast.success(
        `Deleted ${state.data.images.length} Docker ${state.data.images.length === 1 ? "image" : "images"}.`
      );

      startTransition(() => {
        setOpen(false);
        table.resetRowSelection();
      });
    }
  }, [state, isPending, hasSubmitted, table]);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild className={cn(images.length === 0 && "hidden")}>
        <Button
          aria-label={`Delete ${totalImages} selected images`}
          size="icon-sm"
          variant="destructive-ghost"
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          confirmButtonRef.current?.focus();
        }}
      >
        <form
          action={action}
          className="space-y-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          {images.map((image) => (
            <input
              key={image.id}
              name="images"
              type="hidden"
              value={image.id}
            />
          ))}

          <DialogHeader>
            <DialogTitle>{`Remove ${totalImages} ${entityLabel}?`}</DialogTitle>
            <DialogDescription>
              {`You are about to permanently remove ${totalImages} Docker ${entityLabel}. This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {images.map((image) => (
              <Item
                className="flex-nowrap p-2"
                key={image.id}
                variant="outline"
              >
                <ItemContent>
                  <ItemTitle>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="w-full max-w-32 overflow-hidden text-ellipsis">
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
                <Field className="p-3!" orientation="horizontal">
                  <Checkbox
                    aria-label="Force delete selected images"
                    id="force-delete"
                    name="force"
                  />

                  <FieldContent>
                    <FieldTitle>Force remove</FieldTitle>
                    <FieldDescription>
                      Docker stops and removes containers using these images.
                    </FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </FieldSet>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button size="sm" type="button" variant="secondary">
                Cancel
                <KbdGroup>
                  <Kbd>ESC</Kbd>
                </KbdGroup>
              </Button>
            </DialogClose>

            <Button
              disabled={isPending}
              ref={confirmButtonRef}
              size="sm"
              type="submit"
              variant="destructive"
            >
              {`Delete ${entityLabel}`}
              {isPending ? (
                <Spinner />
              ) : (
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
