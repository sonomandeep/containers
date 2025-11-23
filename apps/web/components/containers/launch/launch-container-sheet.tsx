"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SheetHeaderBackButton,
  SheetHeaderContent,
  SheetHeaderIcon,
  SheetHeaderToolbar,
} from "@/components/core/sheet-header";

export function LaunchContainerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="size-3.5 opacity-80" />
          New Container
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeaderToolbar>
          <SheetHeaderBackButton />
        </SheetHeaderToolbar>

        <SheetHeaderContent>
          <SheetHeaderIcon />

          <div className="flex flex-col gap-1">
            <SheetTitle>New Container</SheetTitle>
            <SheetDescription>
              Configure and launch a new workload.
            </SheetDescription>
          </div>
        </SheetHeaderContent>

        <div className="p-4">Hello World</div>
      </SheetContent>
    </Sheet>
  );
}
