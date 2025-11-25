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
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";

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
          aria-label={`Delete ${images.length} selected images`}
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
