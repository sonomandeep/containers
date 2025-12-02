"use client";

import type { Container } from "@containers/shared";
import { format, formatDistanceToNow } from "date-fns";
import { ActivityIcon, BoxIcon, ScrollTextIcon } from "lucide-react";
import {
  SheetHeaderBackButton,
  SheetHeaderBadge,
  SheetHeaderContent,
  SheetHeaderIcon,
  SheetHeaderToolbar,
} from "@/components/core/sheet-header";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContainerSheetInfo } from "./container-sheet-info";
import { ContainerSheetMetrics } from "./container-sheet-metrics";

type Props = {
  container: Container;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ContainerSheet({ container, open, onOpenChange }: Props) {
  const createdAt = container.created * 1000;
  const createdLabel = format(createdAt, "eee dd MMM yyyy");
  const createdRelative = formatDistanceToNow(createdAt, { addSuffix: true });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="p-0">
        <div className="flex flex-1 flex-col overflow-hidden">
          <SheetHeaderToolbar>
            <div className="inline-flex items-center gap-2">
              <SheetHeaderBackButton />
              <SheetHeaderBadge icon={BoxIcon}>
                {container.id.slice(0, 12)}
              </SheetHeaderBadge>
            </div>
          </SheetHeaderToolbar>

          <SheetHeaderContent>
            <SheetHeaderIcon>
              <BoxIcon className="size-5 opacity-70" />
            </SheetHeaderIcon>

            <div className="flex flex-col">
              <SheetTitle>{container.name}</SheetTitle>

              <SheetDescription>
                Created&nbsp;
                {createdRelative}
              </SheetDescription>
            </div>
          </SheetHeaderContent>

          <ContainerSheetInfo
            container={container}
            createdLabel={createdLabel}
          />

          <div className="min-h-0 flex-1 overflow-hidden">
            <Tabs className="flex h-full flex-col gap-0" defaultValue="metrics">
              <div className="border-secondary border-b p-4">
                <TabsList className="gap-2">
                  <TabsTrigger value="metrics">
                    <ActivityIcon
                      aria-hidden="true"
                      className="-ms-0.5 size-3.5 opacity-60"
                    />
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <ScrollTextIcon
                      aria-hidden="true"
                      className="-ms-0.5 size-3.5 opacity-60"
                      size={16}
                    />
                    Logs
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent className="flex-1 overflow-y-auto" value="metrics">
                <ContainerSheetMetrics metrics={container.metrics} />
              </TabsContent>

              <TabsContent className="flex-1 overflow-y-auto" value="logs">
                <div className="p-4 text-muted-foreground text-sm">
                  Logs will appear here.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <SheetFooter className="border-secondary border-t p-2">
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
