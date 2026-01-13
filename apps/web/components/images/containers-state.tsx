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
      count: state ? state[key] : 0,
      ...containerStateMeta[key],
    }))
    .filter((item) => item.count > 0);

  if (!items.length) {
    return (
      <Badge className="font-mono text-muted-foreground" variant="outline">
        0
      </Badge>
    );
  }

  return (
    <div className="inline-flex flex-wrap gap-2">
      {items.map(({ key, count, label, dotClass }) => (
        <Tooltip key={key}>
          <TooltipTrigger>
            <Badge className="gap-1.5" variant="outline">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${dotClass}`}
              />
              <span className="font-mono">{count}</span>
              <span className="sr-only">{label}</span>
            </Badge>
          </TooltipTrigger>

          <TooltipContent>
            <span className="font-medium text-xs">{label}</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
