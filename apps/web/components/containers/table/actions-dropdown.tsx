"use client";

import type {
  Container,
} from "@containers/shared";
import {
  MoreHorizontalIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ContainerActionId = "start" | "stop" | "remove";

interface ContainerActionsDropdownProps {
  container: Container;
}

export default function ContainerActionsDropdown({
  container,
}: ContainerActionsDropdownProps) {
  const { state } = container;

  const actionItems: Array<{
    id: ContainerActionId;
    label: string;
    icon: typeof PlayIcon;
    disabled: boolean;
    variant?: "default" | "destructive";
  }> = [
    {
      id: "start",
      label: "Start",
      icon: PlayIcon,
      disabled: state !== "exited",
    },
    {
      id: "stop",
      label: "Stop",
      icon: SquareIcon,
      disabled: state !== "running" && state !== "paused",
    },
    {
      id: "remove",
      label: "Remove",
      icon: Trash2Icon,
      disabled:
          state === "running" || state === "paused" || state === "restarting",
      variant: "destructive",
    },
  ];

  const handleAction = (action: ContainerActionId, label: string) => {
    toast.info(label, {
      description: `${container.name} (${container.id.slice(0, 12)}) ${action} action will be wired soon.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-row-click-ignore
          size="icon-sm"
          variant="ghost"
          aria-label={`Open actions for ${container.name}`}
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {actionItems.map(({ id, label, icon: Icon, disabled, variant }) => (
          <DropdownMenuItem
            key={id}
            data-row-click-ignore
            onSelect={() => handleAction(id, label)}
            disabled={disabled}
            variant={variant}
          >
            <Icon className="size-3.5" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
