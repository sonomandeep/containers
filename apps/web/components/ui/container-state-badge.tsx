"use client";

import type { ContainerState } from "@containers/shared";
import type { ComponentProps, ComponentType } from "react";
import { PauseIcon, PlayIcon, SquareIcon } from "lucide-react";
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
      <Badge variant="outline" className={className}>
        {state}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("gap-1.5", className)}>
      {showIcon && Icon ? <Icon className="size-3.5" /> : null}
      {config.label}
    </Badge>
  );
}
