import { CornerDownLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function PullImageDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          Pull Image
          <CornerDownLeftIcon className="size-3.5 opacity-60" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull Image</DialogTitle>
          <DialogDescription>
            Enter the name and tag of the image you want to pull.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Image Name" />
          <Input placeholder="Tag" />
        </div>
        <DialogFooter>
          <Button type="submit">Pull</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
