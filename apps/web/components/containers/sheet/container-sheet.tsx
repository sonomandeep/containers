"use client";

import type { Container } from "@containers/shared";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  container: Container | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerSheet({ container, open, onOpenChange }: Props) {
  const createdAt
    = container && container.created
      ? format(container.created * 1000, "eee dd MMM yyyy, HH:mm")
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {container ? container.name : "Container details"}
          </SheetTitle>
          <SheetDescription>
            {container
              ? "Inspect the selected container and perform quick actions."
              : "Select a container row to view its details."}
          </SheetDescription>
        </SheetHeader>

        {container
          ? (
              <div className="grid flex-1 auto-rows-min gap-6 px-4">
                <div className="grid gap-3">
                  <Label htmlFor="container-sheet-id">Container ID</Label>
                  <Input
                    id="container-sheet-id"
                    value={container.id}
                    readOnly
                    className="font-mono"
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="container-sheet-image">Image</Label>
                  <Input
                    id="container-sheet-image"
                    value={container.image}
                    readOnly
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="container-sheet-state">Status</Label>
                  <Input
                    id="container-sheet-state"
                    value={container.state}
                    readOnly
                    className="uppercase"
                  />
                </div>
                <div className="grid gap-3">
                  <Label>Ports</Label>
                  {container.ports.length
                    ? (
                        <div className="flex flex-wrap gap-2">
                          {container.ports.map((port) => (
                            <span
                              key={`${port.ip}-${port.publicPort}-${port.privatePort}`}
                              className="rounded-md border px-2 py-1 text-sm font-medium font-mono"
                            >
                              {port.publicPort}
                              :
                              {port.privatePort}
                            </span>
                          ))}
                        </div>
                      )
                    : (
                        <Input value="-" readOnly />
                      )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="container-sheet-created">Created</Label>
                  <Input
                    id="container-sheet-created"
                    value={createdAt ?? "-"}
                    readOnly
                  />
                </div>
              </div>
            )
          : (
              <div className="px-4 py-8 text-sm text-muted-foreground">
                Select a container to populate this panel.
              </div>
            )}

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
