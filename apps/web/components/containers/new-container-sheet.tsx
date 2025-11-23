"use client";

import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function NewContainerSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <PlusIcon className="size-3.5 opacity-80" />
          New Container
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>New Container</SheetTitle>
        </SheetHeader>

        <div className="p-4">Hello World</div>
      </SheetContent>
    </Sheet>
  );
}
