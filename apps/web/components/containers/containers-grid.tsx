"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ContainerCard } from "./container-card";
import { useContainersStore } from "@/lib/store/containers.store";

export function ContainersGrid() {
  const containers = useContainersStore((state) => state.containers);

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="grid @7xl:grid-cols-4 grid-cols-3 gap-4">
        {containers.map((container) => (
          <ContainerCard container={container} key={container.id} />
        ))}
      </div>
    </ScrollArea>
  );
}
