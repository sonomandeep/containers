"use client";

import type { Image } from "@containers/shared";
import { CornerDownLeftIcon, Trash2Icon } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { ContainersState } from "@/components/images/containers-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
    }
  }, [state, isPending, hasSubmitted]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="destructive-ghost"
          aria-label={`Delete ${totalImages} selected images`}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form
          action={action}
          className="space-y-4"
          onSubmit={() => setHasSubmitted(true)}
        >
          {images.map((image) => (
            <input key={image.id} type="hidden" name="images" value={image.id} />
          ))}

          <AlertDialogHeader>
            <AlertDialogTitle>
              {`Remove ${totalImages} ${entityLabel}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {`You are about to permanently remove ${totalImages} Docker ${entityLabel}. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

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

          <AlertDialogFooter>
            <AlertDialogCancel variant="secondary" size="sm" type="button">
              <>
                Cancel
                <KbdGroup>
                  <Kbd>ESC</Kbd>
                </KbdGroup>
              </>
            </AlertDialogCancel>

            <AlertDialogAction size="sm" variant="destructive" type="submit">
              <>
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
              </>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
