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
import { removeContainerAction } from "@/lib/actions/containers.actions";

interface ContainerActionsDropdownProps {
  container: Container;
}

export default function ContainerActionsDropdown({
  container,
}: ContainerActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
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

      <DropdownMenuContent data-row-click-ignore align="end" className="w-44">
        <StartContainerAction
          container={container}
          closeDropdown={() => setOpen(false)}
        />
        <StopContainerAction
          container={container}
          closeDropdown={() => setOpen(false)}
        />
        <RemoveContainerAction
          container={container}
          closeDropdown={() => setOpen(false)}
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
      variant={variant}
      onSelect={(event) => {
        event.preventDefault();
        if (disabled)
          return;

        onSelect?.();
      }}
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
  const disabled = container.state !== "exited";

  return (
    <ContainerActionItem
      icon={PlayIcon}
      label="Start"
      disabled={disabled}
      onSelect={() => {
        showUnavailableActionToast("Start", "start", container);
        closeDropdown();
      }}
    />
  );
}

function StopContainerAction({
  container,
  closeDropdown,
}: ContainerActionComponentProps) {
  const disabled
    = container.state !== "running" && container.state !== "paused";

  return (
    <ContainerActionItem
      icon={SquareIcon}
      label="Stop"
      disabled={disabled}
      onSelect={() => {
        showUnavailableActionToast("Stop", "stop", container);
        closeDropdown();
      }}
    />
  );
}

function RemoveContainerAction({
  container,
  closeDropdown,
}: ContainerActionComponentProps) {
  const [isPending, startTransition] = useTransition();
  const disabled
    = container.state === "running"
      || container.state === "paused"
      || container.state === "restarting"
      || isPending;

  const handleRemove = () => {
    startTransition(async () => {
      const { error } = await removeContainerAction(container.id);

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(
        `Removed ${container.name} (${container.id.slice(0, 12)}).`,
      );

      closeDropdown();
    });
  };

  return (
    <ContainerActionItem
      icon={Trash2Icon}
      label="Remove"
      variant="destructive"
      disabled={disabled}
      onSelect={handleRemove}
    />
  );
}

function showUnavailableActionToast(
  label: string,
  action: string,
  container: Container,
) {
  toast.info(label, {
    description: `${container.name} (${container.id.slice(0, 12)}) ${action} action will be wired soon.`,
  });
}
