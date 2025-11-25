"use client";

import type { Image } from "@containers/shared";
import { CornerDownLeftIcon, Trash2Icon } from "lucide-react";
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
import { ContainersState } from "../containers-state";

interface Props {
  images: Array<Image>;
}

export default function RemoveImagesDialog({ images }: Props) {
  const totalImages = images.length;
  const entityLabel = totalImages === 1 ? "image" : "images";

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
            <Item key={image.id} variant="outline" className="p-2 flex-nowrap">
              <ItemContent className="overflow-hidden">
                <ItemTitle>{image.repoTags.at(0) || "none"}</ItemTitle>
              </ItemContent>

              <ItemActions><ContainersState state={image.containers} /></ItemActions>
            </Item>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel variant="secondary" size="sm">
            <>
              Cancel
              <KbdGroup>
                <Kbd>ESC</Kbd>
              </KbdGroup>
            </>
          </AlertDialogCancel>

          <AlertDialogAction size="sm" variant="destructive">
            <>
              {
                `Delete ${entityLabel}`
              }
              {false
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
      </AlertDialogContent>
    </AlertDialog>
  );
}
