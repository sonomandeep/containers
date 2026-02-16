"use client";

import type { Container } from "@containers/shared";
import { BoxIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContainersStore } from "@/lib/store/containers.store";
import { ContainerCard } from "./container-card";

type Props = {
  initialContainers: Array<Container>;
};

export function ContainersGrid({ initialContainers }: Props) {
  const { containers, initialized } = useContainersStore((state) => state);
  const visibleContainers = initialized ? containers : initialContainers;

  if (visibleContainers.length === 0) {
    return (
      <Empty className="min-h-0 flex-1 rounded-md border border-card-border border-dashed bg-card/50">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BoxIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No containers yet</EmptyTitle>
          <EmptyDescription>
            Launch your first container to start seeing live metrics here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="grid @7xl:grid-cols-4 grid-cols-3 gap-4">
        {visibleContainers.map((container) => (
          <ContainerCard container={container} key={container.id} />
        ))}
      </div>
    </ScrollArea>
  );
}
