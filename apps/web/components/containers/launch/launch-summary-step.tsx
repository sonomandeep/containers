"use client";

import { ArrowLeftIcon, RocketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContainerPortBadge } from "@/components/ui/container-port-badge";
import { InfoCard, InfoCardRow } from "@/components/ui/info-card";
import { useLaunchContainerStore } from "@/lib/store";

interface Props {
  handleBack: () => void;
}

export function LaunchSummaryStep({ handleBack }: Props) {
  const state = useLaunchContainerStore((store) => store);

  const ports = state.ports?.length > 0 ? state.ports : [];

  const envs
    = state.envs?.length > 0
      ? state.envs
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <InfoCard>
          <InfoCardRow label="Name">{state.name || "—"}</InfoCardRow>
          <InfoCardRow label="Image">{state.image || "—"}</InfoCardRow>
          <InfoCardRow label="Command">
            {state.command
              ? (
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {state.command}
                  </code>
                )
              : (
                  "—"
                )}
          </InfoCardRow>
          <InfoCardRow label="Restart policy">
            {state.restartPolicy || "—"}
          </InfoCardRow>
        </InfoCard>

        <InfoCard>
          <InfoCardRow label="CPU">{state.cpu || "—"}</InfoCardRow>
          <InfoCardRow label="Memory (MB)">{state.memory || "—"}</InfoCardRow>
          <InfoCardRow label="Network">{state.network || "—"}</InfoCardRow>
          <InfoCardRow label="Ports">
            <div className="flex flex-wrap gap-2">
              {ports.length > 0
                ? (
                    ports.map((port) => (
                      <ContainerPortBadge
                        key={`${port.hostPort}-${port.containerPort}`}
                        port={{
                          ip: "0.0.0.0",
                          publicPort: Number(port.hostPort),
                          privatePort: Number(port.containerPort),
                          type: "tcp",
                        }}
                        showIpLabel={false}
                      />
                    ))
                  )
                : (
                    <span className="text-muted-foreground text-xs">No port mappings defined.</span>
                  )}
            </div>
          </InfoCardRow>
          <InfoCardRow label="Env">
            <div className="flex flex-wrap gap-2">
              {envs.length > 0
                ? envs.map((env) =>
                    (
                      <Badge
                        key={`${env.key}-${env.value}`}
                        variant="outline"
                      >
                        {env.key}
                      </Badge>
                    ),
                  )
                : (
                    <span className="text-muted-foreground text-xs">No environment variables defined.</span>
                  )}
            </div>
          </InfoCardRow>
        </InfoCard>
      </div>

      <div className="inline-flex items-center justify-between w-full">
        <Button size="sm" type="button" variant="outline" onClick={handleBack}>
          <ArrowLeftIcon className="opacity-60 size-3.5" />
          Back
        </Button>

        <Button size="sm" type="submit">
          Launch
          <RocketIcon className="opacity-60 size-3.5" />
        </Button>
      </div>
    </div>
  );
}
