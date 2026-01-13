import { CornerDownLeftIcon } from "lucide-react";
import {
  Dialog,
  DialogCard,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/core/dialog";
import { Button } from "@/components/ui/button";

export function PullImageDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>
        Pull Image
        <CornerDownLeftIcon className="size-3 opacity-60" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull Image</DialogTitle>
        </DialogHeader>

        <form>
          <DialogCard>aaa</DialogCard>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>

            <Button type="submit">
              Confirm
              <CornerDownLeftIcon className="size-3 opacity-60" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
