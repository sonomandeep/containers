"use client";

import { ContainerStateEnum } from "@containers/shared";
import { RotateCwIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { restartContainer } from "@/lib/services/containers.service";
import { useContainersStore } from "@/lib/store/containers.store";

type Props = {
  id: string;
};

export function RestartContainer({ id }: Props) {
  const [isPending, startTransition] = useTransition();
  const store = useContainersStore((state) => state);

  const handleRestart = () => {
    store.setContainers(
      store.containers.map((container) =>
        container.id === id
          ? {
              ...container,
              state: ContainerStateEnum.restarting,
            }
          : container
      )
    );

    startTransition(() => {
      toast.promise(
        restartContainer(id).then((result) => {
          store.setContainers(
            store.containers.map((container) =>
              container.id === id
                ? {
                    ...container,
                    state: ContainerStateEnum.running,
                    status: "Up 2 seconds",
                  }
                : container
            )
          );

          if (result.error) {
            throw new Error(result.error);
          }

          return result;
        }),
        {
          loading: "Restarting container...",
          success: "Container restarted successfully",
          error: (error) => error.message,
        }
      );
    });
  };

  return (
    <Button onClick={handleRestart} size="icon-sm" variant="ghost">
      {isPending ? <Spinner className="size-3" /> : <RotateCwIcon />}
    </Button>
  );
}
