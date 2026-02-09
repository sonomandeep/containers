"use client";

import { SquareIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { stopContainer } from "@/lib/services/containers.service";
import { useContainersStore } from "@/lib/store/containers.store";

type Props = {
  id: string;
};

export function StopContainer({ id }: Props) {
  const store = useContainersStore((state) => state);
  const [isPending, startTransition] = useTransition();

  const handleStop = () => {
    startTransition(() => {
      toast.promise(
        stopContainer(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          store.setContainers(
            store.containers.map((container) => {
              if (container.id === id) {
                return { ...container, state: "stopping" };
              }

              return container;
            })
          );

          return result;
        }),
        {
          loading: "Queueing stop command...",
          success: "Stop command queued",
          error: (error) => error.message,
        }
      );
    });
  };

  return (
    <Button onClick={handleStop} size="icon-sm" variant="ghost">
      {isPending ? <Spinner className="size-3" /> : <SquareIcon />}
    </Button>
  );
}
