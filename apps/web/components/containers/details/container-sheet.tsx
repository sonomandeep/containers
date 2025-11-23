"use client";

import type { Container } from "@containers/shared";
import { format, formatDistanceToNow } from "date-fns";
import { ActivityIcon, ScrollTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="metrics" className="flex h-full flex-col gap-0">
              <div className="p-4 border-b border-secondary">
                <TabsList className="gap-2">
                  <TabsTrigger value="metrics">
                    <ActivityIcon
                      className="size-3.5 -ms-0.5 opacity-60"
                      aria-hidden="true"
                    />
                    Metrics
                  </TabsTrigger>
                  <TabsTrigger value="logs">
                    <ScrollTextIcon
                      className="size-3.5 -ms-0.5 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    Logs
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="metrics" className="flex-1 overflow-y-auto">
                <ContainerSheetMetrics metrics={container.metrics} />
              </TabsContent>

              <TabsContent value="logs" className="flex-1 overflow-y-auto">
                <div className="p-4 text-sm text-muted-foreground">
                  Logs will appear here.
                </div>
              </TabsContent>
            </Tabs>
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
