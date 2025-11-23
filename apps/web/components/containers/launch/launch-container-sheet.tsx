"use client";

import { BoxIcon, PlusIcon } from "lucide-react";
import {
  SheetHeaderBackButton,
  SheetHeaderBadge,
  SheetHeaderToolbar,
} from "@/components/core/sheet-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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
          <div className="inline-flex items-center gap-2">
            <SheetHeaderBackButton />
            <SheetHeaderBadge icon={BoxIcon}>New Container</SheetHeaderBadge>
          </div>
        </SheetHeaderToolbar>

        <div className="p-4">Hello World</div>
      </SheetContent>
    </Sheet>
  );
}
