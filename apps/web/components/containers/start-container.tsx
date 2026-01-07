"use client";

import { PlayIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { startContainer } from "@/lib/services/containers.service";

type Props = {
  id: string;
};

export function StartContainer({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    startTransition(() => {
      toast.promise(
        startContainer(id).then((result) => {
          if (result.error) {
            throw new Error(result.error);
          }

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
