"use client";

import { ArrowLeftIcon, RocketIcon } from "lucide-react";
import { useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContainerPortBadge } from "@/components/ui/container-port-badge";
import { InfoCard, InfoCardRow } from "@/components/ui/info-card";
import { Spinner } from "@/components/ui/spinner";
import { launchContainerAction } from "@/lib/actions/containers.actions";
import { useLaunchContainerStore } from "@/lib/store";

type Props = {
  handleBack: () => void;
  handleClose: () => void;
};

export function LaunchSummaryStep({ handleBack, handleClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const state = useLaunchContainerStore((store) => store);
  const launchButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    launchButtonRef.current?.focus();
  }, []);

  const ports = state.ports?.length > 0 ? state.ports : [];
  const envs = state.envs?.length > 0 ? state.envs : [];

  const handleSubmit = () => {
    startTransition(async () => {
      const { error, data } = await launchContainerAction({
        name: state.name,
        image: state.image?.repoTags?.at(0) || state?.image?.id || "",
        restartPolicy: state.restartPolicy,
        command: state.command,
        cpu: state.cpu,
        memory: state.memory,
        network: state.network,
        envs: state.envs,
        ports: state.ports,
      });

      if (error) {
        toast.error(error);
        return;
      }

      toast.success(`Launched ${data?.name ?? "container"}.`);
      handleClose();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <InfoCard>
          <InfoCardRow label="Name">{state.name || "—"}</InfoCardRow>
          <InfoCardRow label="Image">
            <div className="inline-flex items-baseline gap-2">
              <span>{state?.image?.repoTags[0] ?? state.image?.id}</span>
              <span className="text-muted-foreground">
                {state?.image?.id.replace("sha256:", "").slice(0, 12)}
              </span>
            </div>
          </InfoCardRow>
          <InfoCardRow label="Command">
            {state.command ? (
              <Badge className="font-mono" variant="outline">
                {state.command}
              </Badge>
            ) : (
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
              {ports.length > 0 ? (
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
              ) : (
                <span className="text-muted-foreground text-xs">
                  No port mappings defined.
                </span>
              )}
            </div>
          </InfoCardRow>
          <InfoCardRow label="Env">
            <div className="flex flex-wrap gap-2">
              {envs.length > 0 ? (
                envs.map((env) => (
                  <Badge
                    className="font-mono"
                    key={`${env.key}-${env.value}`}
                    variant="outline"
                  >
                    {env.key}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-xs">
                  No environment variables defined.
                </span>
              )}
            </div>
          </InfoCardRow>
        </InfoCard>
      </div>

      <div className="inline-flex w-full items-center justify-between">
        <Button onClick={handleBack} size="sm" type="button" variant="outline">
          <ArrowLeftIcon className="size-3.5 opacity-60" />
          Back
        </Button>

        <Button
          disabled={isPending}
          onClick={handleSubmit}
          ref={launchButtonRef}
          size="sm"
          type="button"
        >
          Launch
          {isPending ? (
            <Spinner />
          ) : (
            <RocketIcon className="size-3.5 opacity-60" />
          )}
        </Button>
      </div>
    </div>
  );
}
