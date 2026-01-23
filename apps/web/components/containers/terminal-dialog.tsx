"use client";

import type { Container } from "@containers/shared";
import {
  Dialog,
  DialogCard,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/core/dialog";

type Props = {
  container: Container;
  open: boolean;
  setOpen(value: boolean): void;
};

export default function TerminalDialog({ container, open, setOpen }: Props) {
  return (
    <Dialog
      onOpenChange={(value) => {
        setOpen(value);
      }}
      open={open}
    >
      <DialogContent className="pb-2">
        <DialogHeader>
          <DialogTitle>
            Remote Terminal
            <span>{container.name}</span>
          </DialogTitle>
        </DialogHeader>

        <DialogCard>
          <div>hello</div>
        </DialogCard>
      </DialogContent>
    </Dialog>
  );
}
