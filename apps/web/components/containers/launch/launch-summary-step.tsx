"use client";

import { ArrowLeftIcon, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLaunchContainerStore } from "@/lib/store";

interface Props {
  handleBack: () => void;
}

export function LaunchSummaryStep({ handleBack }: Props) {
  const state = useLaunchContainerStore((state) => state);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-4 text-left">
        <p className="text-sm font-medium">Summary</p>
        <p className="text-sm text-muted-foreground">
          Review your container configuration before launch.
        </p>

        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{state.name}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Image</dt>
            <dd className="font-medium">{state.image}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Ports</dt>
            <dd className="font-medium">8080 → 3000</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Resources</dt>
            <dd className="font-medium">
              1.5 vCPU / 512 MB / restart: on-failure
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">Env</dt>
            <dd className="font-medium">NODE_ENV=production</dd>
          </div>
        </dl>

      </div>

      <div className="inline-flex items-center justify-between w-full">
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={handleBack}
        >
          <ArrowLeftIcon className="opacity-60 size-3.5" />
          Back
        </Button>

        <Button
          size="sm"
          type="submit"
        >
          Luunch
          <RocketIcon className="opacity-60 size-3.5" />
        </Button>
      </div>
    </div>
  );
}
