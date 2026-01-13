"use client";

import { PlayIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { startContainer } from "@/lib/services/containers.service";
import { useContainersStore } from "@/lib/store/containers.store";

type Props = {
  id: string;
};

export function StartContainer({ id }: Props) {
  const [isPending, startTransition] = useTransition();
  const store = useContainersStore((state) => state);

  const handleStart = () => {
    startTransition(() => {
      toast.promise(
        startContainer(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

          if (!result.data) {
            throw new Error("Unexpected error occured, try again later.");
          }

          store.setContainers(
            store.containers.map((container) =>
              container.id === id
                ? { ...result.data, status: "Up 2 seconds" }
                : container
            )
          );

          return result;
        }),
        {
          loading: "Starting container...",
          success: "Container started successfully",
          error: (error) => error.message,
        }
      );
    });
  };

  return (
    <Button onClick={handleStart} size="icon-sm" variant="ghost">
      {isPending ? <Spinner className="size-3" /> : <PlayIcon />}
    </Button>
  );
}
