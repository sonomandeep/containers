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

type ContainerActionId = "start" | "stop" | "remove";

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
  const { state: containerState } = container;
  const [removeState, removeAction, isRemovePending] = useActionState(
    removeContainerAction,
    initialRemoveFormState,
  );
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!removeTargetId)
      return;

    if (removeTargetId !== container.id)
      return;

    if (isRemovePending)
      return;

    if (removeState?.error) {
      const message
        = removeState.error.root
          ?? (typeof removeState.error.containerId === "string"
            ? removeState.error.containerId
            : null)
          ?? "Unable to remove the container.";

      toast.error(message);
      startTransition(() => {
        setRemoveTargetId(null);
      });
      return;
    }

    if (removeState.error === null) {
      toast.success(
        `Removed ${container.name} (${container.id.slice(0, 12)}).`,
      );
      startTransition(() => {
        setRemoveTargetId(null);
      });
    }
  }, [
    removeState,
    isRemovePending,
    removeTargetId,
    container.id,
    container.name,
  ]);

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
      disabled: containerState !== "exited",
    },
    {
      id: "stop",
      label: "Stop",
      icon: SquareIcon,
      disabled: containerState !== "running" && containerState !== "paused",
    },
    {
      id: "remove",
      label: "Remove",
      icon: Trash2Icon,
      disabled:
          containerState === "running"
          || containerState === "paused"
          || containerState === "restarting"
          || isRemovePending,
      variant: "destructive",
    },
  ];

  const handleAction = (action: ContainerActionId, label: string) => {
    if (action === "remove") {
      const formData = new FormData();
      formData.append("containerId", container.id);
      setRemoveTargetId(container.id);
      removeAction(formData);

      return;
    }

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

      <DropdownMenuContent data-row-click-ignore align="end" className="w-44">
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
