"use client";

import type { Image } from "@containers/shared";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const containerStateMeta = {
  running: {
    label: "Running",
    dotClass: "bg-green-500",
  },
  paused: {
    label: "Paused",
    dotClass: "bg-orange-500",
  },
  exited: {
    label: "Exited",
    dotClass: "bg-red-500",
  },
} as const;

type ContainerStateKey = keyof typeof containerStateMeta;

export function ContainersState({ state }: { state: Image["containers"] }) {
  const items = (Object.keys(containerStateMeta) as Array<ContainerStateKey>)
    .map((key) => ({
      key,
      count: state[key],
      ...containerStateMeta[key],
    }))
    .filter((item) => item.count > 0);

  if (!items.length) {
    return (
      <Badge variant="outline" className="font-mono text-muted-foreground">
        0
      </Badge>
    );
  }

  return (
    <div className="inline-flex flex-wrap gap-2">
      {items.map(({ key, count, label, dotClass }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1.5">
              <span
                className={`size-1.5 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <span className="font-mono">{count}</span>
              <span className="sr-only">{label}</span>
            </Badge>
          </TooltipTrigger>

          <TooltipContent>
            <span className="text-xs font-medium">{label}</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
