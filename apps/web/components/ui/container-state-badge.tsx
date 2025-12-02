"use client";

import type { ContainerState } from "@containers/shared";
import { PauseIcon, PlayIcon, RefreshCcwIcon, SquareIcon } from "lucide-react";
import type { ComponentProps, ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StateConfig {
  label: string;
  variant: ComponentProps<typeof Badge>["variant"];
  icon?: ComponentType<ComponentProps<"svg">>;
}

const STATE_CONFIG: Record<ContainerState, StateConfig> = {
  running: {
    label: "Running",
    variant: "success",
    icon: PlayIcon,
  },
  paused: {
    label: "Paused",
    variant: "warning",
    icon: PauseIcon,
  },
  restarting: {
    label: "Restarting",
    variant: "warning",
    icon: RefreshCcwIcon,
  },
  exited: {
    label: "Exited",
    variant: "destructive",
    icon: SquareIcon,
  },
};

interface ContainerStateBadgeProps {
  state: ContainerState;
  className?: string;
  showIcon?: boolean;
}

export function ContainerStateBadge({
  state,
  className,
  showIcon = true,
}: ContainerStateBadgeProps) {
  const config = STATE_CONFIG[state];

  if (!config) {
    return (
      <Badge className={className} variant="outline">
        {state}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge className={cn("gap-1.5", className)} variant={config.variant}>
      {showIcon && Icon ? <Icon className="size-3.5" /> : null}
      {config.label}
    </Badge>
  );
}
