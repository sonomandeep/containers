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
  const [isPending, startTransition] = useTransition();
  const store = useContainersStore((state) => state);

  const handleStop = () => {
    startTransition(() => {
      toast.promise(
        stopContainer(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          if (!result.data) {
            throw new Error("Unexpected error occured, try again later.");
          }

          store.setContainers(
            store.containers.map((container) =>
              container.id === id
                ? { ...result.data, status: "Exited now" }
                : container
            )
          );
          return result;
        }),
        {
          loading: "Stopping container...",
          success: "Container stopped successfully",
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
