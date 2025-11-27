"use client";

import type { Container } from "@containers/shared";
import type { RemoveContainerActionFormState } from "@/lib/actions/containers.actions";
import {
  MoreHorizontalIcon,
  PlayIcon,
  SquareIcon,
  Trash2Icon,
} from "lucide-react";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeContainerAction } from "@/lib/actions/containers.actions";

const initialRemoveFormState: RemoveContainerActionFormState = {
  data: {},
  error: null,
};

interface ContainerActionsDropdownProps {
  container: Container;
}

export default function ContainerActionsDropdown({
  container,
}: ContainerActionsDropdownProps) {
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

      <DropdownMenuContent data-row-click-ignore align="end" className="w-44">
        <StartContainerAction container={container} />
        <StopContainerAction container={container} />
        <RemoveContainerAction container={container} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface ContainerActionComponentProps {
  container: Container;
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

function StartContainerAction({ container }: ContainerActionComponentProps) {
  const disabled = container.state !== "exited";

  return (
    <ContainerActionItem
      icon={PlayIcon}
      label="Start"
      disabled={disabled}
      onSelect={() => showUnavailableActionToast("Start", "start", container)}
    />
  );
}

function StopContainerAction({ container }: ContainerActionComponentProps) {
  const disabled
    = container.state !== "running" && container.state !== "paused";

  return (
    <ContainerActionItem
      icon={SquareIcon}
      label="Stop"
      disabled={disabled}
      onSelect={() => showUnavailableActionToast("Stop", "stop", container)}
    />
  );
}

function RemoveContainerAction({ container }: ContainerActionComponentProps) {
  const [state, action, isPending] = useActionState(
    removeContainerAction,
    initialRemoveFormState,
  );
  const [pendingContainer, setPendingContainer] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!pendingContainer)
      return;

    if (isPending)
      return;

    if (state?.error) {
      const message
        = state.error.root
          ?? (typeof state.error.containerId === "string"
            ? state.error.containerId
            : null)
          ?? "Unable to remove the container.";

      toast.error(message);
      startTransition(() => {
        setPendingContainer(null);
      });
      return;
    }

    toast.success(
      `Removed ${pendingContainer.name} (${pendingContainer.id.slice(0, 12)}).`,
    );
    startTransition(() => {
      setPendingContainer(null);
    });
  }, [state, isPending, pendingContainer]);

  const disabled
    = container.state === "running"
      || container.state === "paused"
      || container.state === "restarting"
      || isPending;

  const handleSelect = () => {
    const formData = new FormData();
    formData.append("containerId", container.id);
    setPendingContainer({ id: container.id, name: container.name });
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <ContainerActionItem
      icon={Trash2Icon}
      label="Remove"
      variant="destructive"
      disabled={disabled}
      onSelect={handleSelect}
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
