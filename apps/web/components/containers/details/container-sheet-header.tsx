"use client";

import type { Container } from "@containers/shared";
import {
  BoxIcon,
  ChevronLeftIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  container: Container;
  createdRelative: string;
}

export function ContainerSheetHeader({ container, createdRelative }: Props) {
  return (
    <>
      <div className="flex items-center px-4 h-[53px] border-b border-secondary">
        <div className="inline-flex items-center">
          <div className="inline-flex items-center gap-2">
            <SheetClose asChild>
              <Button size="icon-xs" variant="ghost">
                <ChevronLeftIcon className="size-3.5 opacity-60" />
              </Button>
            </SheetClose>

            <div className="h-6 bg-neutral-100 inline-flex items-center gap-1.5 px-2 rounded-md">
              <BoxIcon className="size-3.5 opacity-60" />
              <span className="text-sm text-muted-foreground">
                {container.id.slice(0, 12)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SheetHeader className="border-b border-secondary flex-row items-center gap-4">
        <div className="bg-secondary size-10 rounded-md" />

        <div className="flex-col items-center">
          <SheetTitle>{container.name}</SheetTitle>

          <SheetDescription>
            Created&nbsp;
            {createdRelative}
          </SheetDescription>
        </div>
      </SheetHeader>
    </>
  );
}
