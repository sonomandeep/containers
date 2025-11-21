"use client";

import type { Container } from "@containers/shared";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { ContainerSheetHeader } from "./container-sheet-header";
import { ContainerSheetInfo } from "./container-sheet-info";
import { ContainerSheetMetrics } from "./container-sheet-metrics";

interface Props {
  container: Container;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerSheet({ container, open, onOpenChange }: Props) {
  const createdAt = container.created * 1000;
  const createdLabel = format(createdAt, "eee dd MMM yyyy");
  const createdRelative = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0">
        <div className="flex flex-1 flex-col overflow-hidden">
          <ContainerSheetHeader
            container={container}
            createdRelative={createdRelative}
          />

          <ContainerSheetInfo
            container={container}
            createdLabel={createdLabel}
          />

          <div className="flex-1 overflow-y-auto min-h-0">
            <ContainerSheetMetrics metrics={container.metrics} />
          </div>
        </div>

        <SheetFooter className="border-t border-secondary p-2">
          <div className="inline-flex items-center justify-end">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
