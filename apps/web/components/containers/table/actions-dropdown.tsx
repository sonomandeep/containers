"use client";

import type { Container } from "@containers/shared";
import {
  MoreHorizontalIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  removeContainerAction,
  startContainerAction,
  stopContainerAction,
} from "@/lib/actions/containers.actions";

interface ContainerActionsDropdownProps {
  container: Container;
}

export default function ContainerActionsDropdown({
  container,
}: ContainerActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setOpen} open={open}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Open actions for ${container.name}`}
          data-row-click-ignore
          size="icon-sm"
          variant="ghost"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44" data-row-click-ignore>
        <StartContainerAction
          closeDropdown={() => setOpen(false)}
          container={container}
        />
        <StopContainerAction
          closeDropdown={() => setOpen(false)}
          container={container}
        />
        <RemoveContainerAction
          closeDropdown={() => setOpen(false)}
          container={container}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ContainerActionComponentProps {
  container: Container;
  closeDropdown: () => void;
}

interface ContainerActionItemProps {
  icon: typeof PlayIcon;
  label: string;
  disabled?: boolean;
  variant?: "default" | "destructive";
  onSelect?: () => void;
}

function ContainerActionItem({
  icon: Icon,
  label,
  disabled = false,
  variant = "default",
  onSelect,
}: ContainerActionItemProps) {
  return (
    <DropdownMenuItem
      data-row-click-ignore
      disabled={disabled}
      onSelect={(event) => {
        event.preventDefault();
        if (disabled) return;

        onSelect?.();
      }}
      variant={variant}
    >
      <Icon className="size-3.5" />
      {label}
    </DropdownMenuItem>
  );
}

function StartContainerAction({
  container,
  closeDropdown,
}: ContainerActionComponentProps) {
  const [isPending, startTransition] = useTransition();
  const disabled = container.state !== "exited" || isPending;

  const handleStart = () => {
    startTransition(async () => {
      const { error } = await startContainerAction(container.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        `Started ${container.name} (${container.id.slice(0, 12)}).`
      );

      closeDropdown();
    });
  };

  return (
    <ContainerActionItem
      disabled={disabled}
      icon={PlayIcon}
      label="Start"
      onSelect={handleStart}
    />
  );
}

function StopContainerAction({
  container,
  closeDropdown,
}: ContainerActionComponentProps) {
  const [isPending, startTransition] = useTransition();
  const disabled =
    (container.state !== "running" && container.state !== "paused") ||
    isPending;

  const handleStop = () => {
    startTransition(async () => {
      const { error } = await stopContainerAction(container.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        `Stopped ${container.name} (${container.id.slice(0, 12)}).`
      );

      closeDropdown();
    });
  };

  return (
    <ContainerActionItem
      disabled={disabled}
      icon={SquareIcon}
      label="Stop"
      onSelect={handleStop}
    />
  );
}

function RemoveContainerAction({
  container,
  closeDropdown,
}: ContainerActionComponentProps) {
  const [isPending, startTransition] = useTransition();
  const disabled =
    container.state === "running" ||
    container.state === "paused" ||
    container.state === "restarting" ||
    isPending;

  const handleRemove = () => {
    startTransition(async () => {
      const { error } = await removeContainerAction(container.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        `Removed ${container.name} (${container.id.slice(0, 12)}).`
      );

      closeDropdown();
    });
  };

  return (
    <ContainerActionItem
      disabled={disabled}
      icon={Trash2Icon}
      label="Remove"
      onSelect={handleRemove}
      variant="destructive"
    />
  );
}
