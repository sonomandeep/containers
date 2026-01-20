"use client";

import type { BasicStepInput, ConfigStepInput } from "@containers/shared";
import {
  BoxIcon,
  CornerDownLeftIcon,
  CpuIcon,
  FolderKeyIcon,
  LayersIcon,
  type LucideIcon,
  MemoryStickIcon,
  NetworkIcon,
  RotateCcwIcon,
  TerminalIcon,
  WorkflowIcon,
} from "lucide-react";
import { type ReactNode, useTransition } from "react";
import { DialogCard, DialogFooter } from "@/components/core/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ContainerPortBadge } from "../container-port-badge";
import { EnvBadge } from "../env-badge";
import { launchContainer } from "@/lib/services/containers.service";

type Props = {
  goBack: () => void;
  formState: { basic: BasicStepInput; config: ConfigStepInput };
};

export function SummaryStep({ formState, goBack }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    startTransition(() => {
      launchContainer({ ...formState.basic, ...formState.config });
    });
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <DialogCard className="mx-0 w-full">
          <Info icon={BoxIcon} label="Name">
            {formState.basic.name || "-"}
          </Info>

          <Info icon={LayersIcon} label="Image">
            {formState.basic.image || "-"}
          </Info>

          <Info icon={TerminalIcon} label="Command">
            {formState.basic.command || "-"}
          </Info>

          <Info icon={RotateCcwIcon} label="Restart Policy">
            {formState.basic.restartPolicy || "-"}
          </Info>
        </DialogCard>

        <DialogCard className="mx-0 w-full">
          <Info icon={CpuIcon} label="CPU">
            {formState.config.cpu || "-"}
          </Info>

          <Info icon={MemoryStickIcon} label="Memory">
            {formState.config.memory || "-"}
          </Info>

          <Info icon={WorkflowIcon} label="Network">
            {formState.config.network || "-"}
          </Info>

          <Info icon={NetworkIcon} label="Ports">
            {formState.config.ports && formState.config.ports.length > 0 ? (
              <div className="inline-flex flex-nowrap gap-2 overflow-hidden">
                {formState.config.ports.map((port) => (
                  <ContainerPortBadge
                    container={Number(port.private)}
                    host={Number(port.public)}
                    ipVersion="IpV4"
                    key={`${port.public}:${port.private}`}
                  />
                ))}
              </div>
            ) : (
              "-"
            )}
          </Info>

          <Info icon={FolderKeyIcon} label="Envs">
            {formState.config.envs && formState.config.envs.length > 0 ? (
              <div className="inline-flex flex-nowrap gap-2 overflow-hidden">
                {formState.config.envs.map((env) => (
                  <EnvBadge key={env.key} label={env.key} />
                ))}
              </div>
            ) : (
              "-"
            )}
          </Info>
        </DialogCard>
      </div>

      <DialogFooter className="px-0">
        <Button onClick={goBack} type="button" variant="outline">
          Back
        </Button>

        <Button type="submit" disabled={isPending} onClick={handleSubmit}>
          Confirm
          {isPending ? (
            <Spinner className="size-3" />
          ) : (
            <CornerDownLeftIcon className="size-3 opacity-60" />
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function Info({
  icon,
  label,
  children,
}: {
  icon?: LucideIcon;
  label: ReactNode;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3">
      <div className="inline-flex items-center gap-1.5 text-muted-foreground text-sm">
        {Icon ? <Icon className="size-3.5 opacity-60" /> : null}
        <span>{label}</span>
      </div>

      <div className="text-foreground text-sm *:text-sm">{children}</div>
    </div>
  );
}
