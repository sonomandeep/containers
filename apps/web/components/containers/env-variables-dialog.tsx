"use client";

import {
  AlertTriangleIcon,
  CornerDownLeftIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "../ui/input";

type Props = {
  id: string;
  name: string;
  open: boolean;
  setOpen(value: boolean): void;
};

export default function EnvVariablesDialog({ id, name, open, setOpen }: Props) {
  const [isPending, setIsPending] = useState(false);

  return (
    <Dialog onOpenChange={(value) => setOpen(value)} open={open}>
      <DialogContent className="gap-0! bg-neutral-100! p-0!">
        <DialogHeader>
          <div className="inline-flex items-baseline gap-2 p-2">
            <DialogTitle className="text-sm!">
              Environment Variables
            </DialogTitle>
            <span className="text-muted-foreground text-xs">{name}</span>
          </div>
        </DialogHeader>

        <div className="mx-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3">
          <Alert variant="warning">
            <div className="inline-flex items-center gap-2">
              <AlertTriangleIcon className="size-3" />
              <AlertTitle>
                Saving will restart <span className="font-mono">{name}</span>
                &nbsp;container.
              </AlertTitle>
            </div>
          </Alert>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="inline-flex gap-2 font-mono">
                <Input placeholder="KEY" />
                <Input placeholder="VALUE" />

                <Button size="icon" variant="ghost">
                  <Trash2Icon className="opacity-60" />
                </Button>
              </div>

              <div className="inline-flex gap-2 font-mono">
                <Input placeholder="KEY" />
                <Input placeholder="VALUE" />

                <Button size="icon" variant="ghost">
                  <Trash2Icon className="opacity-60" />
                </Button>
              </div>
            </div>

            <Button
              className="border-dashed text-muted-foreground"
              variant="outline"
            >
              <PlusIcon /> Add Variable
            </Button>
          </div>
        </div>

        <DialogFooter className="p-2">
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>

          <Button disabled={isPending} type="submit">
            Confirm
            {isPending ? (
              <Spinner className="size-3" />
            ) : (
              <CornerDownLeftIcon className="size-3 opacity-60" />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
