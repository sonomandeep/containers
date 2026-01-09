"use client";

import {
  ContainerStateEnum,
  type Container,
  type ContainerPort,
} from "@containers/shared";
import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/core/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContainersStore } from "@/lib/store/containers.store";
import { ContainerMenu } from "./container-menu";
import { ContainerPortBadge } from "./container-port-badge";
import { ContainerStateBadge } from "./container-state-badge";
import { StartContainer } from "./start-container";
import { StopContainer } from "./stop-container";
import { RestartContainer } from "./restart-container";

type Props = {
  container: Container;
};

export function ContainerCard({ container }: Props) {
  const containers = useContainersStore((state) => state.containers);

  return (
    <Card key={container.id}>
      <CardToolbar>
        <span className="font-mono">{container.id.slice(0, 12)}</span>

        <ContainerActions container={container} />
      </CardToolbar>

      <CardContent>
        <CardHeader>
          <div className="inline-flex w-full items-center justify-between">
            <CardTitle>{container.name}</CardTitle>
            <ContainerStateBadge state={container.state} />
          </div>

          <CardDescription>{container.image}</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          <ContainerMetric
            label="CPU"
            value={formatCpuUsage(container.id, containers)}
          />
          <ContainerMetric
            label="Memory"
            sub={formatMemoryUsage(container.id, containers).sub}
            value={formatMemoryUsage(container.id, containers).percent}
          />
          <ContainerMetric label="Network" value="-" />
          <ContainerMetric label="Disk I/O" value="-" />
        </div>

        <ContainerPorts ports={container.ports} />
      </CardContent>

      <CardFooter className="justify-between">
        <ContainerStatus container={container} />
        <span>{container.host}</span>
      </CardFooter>
    </Card>
  );
}

function ContainerActions({ container }: { container: Container }) {
  return (
    <div className="inline-flex items-center gap-1">
      {container.state === "running" && <StopContainer id={container.id} />}

      {container.state === "running" && <RestartContainer id={container.id} />}

      {container.state === "paused" ||
        (container.state === "exited" && <StartContainer id={container.id} />)}

      <ContainerMenu container={container} />
    </div>
  );
}

function ContainerMetric({
  label,
  value,
  sub = "",
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <span className="text-muted-foreground">{label}</span>
      <div className="inline-flex gap-2">
        <p className="font-medium text-neutral-700 text-sm">{value}</p>
        <span className="text-muted-foreground text-sm">{sub}</span>
      </div>
    </div>
  );
}

function ContainerPorts({ ports }: { ports: Array<ContainerPort> }) {
  if (ports.length === 0) {
    return (
      <Badge className="font-mono" variant="outline">
        <p className="font-medium">No Ports</p>
      </Badge>
    );
  }

  return (
    <div className="inline-flex flex-nowrap gap-2 overflow-hidden">
      {ports.map((port) => (
        <ContainerPortBadge
          container={port.private}
          host={port.public}
          ipVersion={port.ipVersion}
          key={`${port.ipVersion}_${port.public}:${port.private}`}
        />
      ))}
    </div>
  );
}

function ContainerStatus({ container }: { container: Container }) {
  if (container.state === ContainerStateEnum.restarting) {
    return (
      <div className="text-amber-600 inline-flex items-center gap-2">
        <AlertTriangleIcon className="size-3" />
        <span>Restarting</span>
      </div>
    );
  }

  return <span>{container.status}</span>;
}

function formatCpuUsage(id: string, containers: Array<Container>) {
  const current = containers.find((item) => item.id === id);
  const cpu = current?.metrics?.cpu;

  if (current === undefined || cpu === undefined) {
    return "-";
  }

  return `${cpu.toFixed(1)} %`;
}

function formatMemoryUsage(id: string, containers: Array<Container>) {
  const m = containers.find((c) => c.id === id)?.metrics?.memory;
  if (!m || m.used === null || m.total === null || m.total <= 0) {
    return { percent: "-", memoryFormatted: undefined as string | undefined };
  }

  const percent = `${((m.used / m.total) * 100).toFixed(1)} %`;

  const GB = 1024 ** 3;
  const MB = 1024 ** 2;

  const useMB = m.total < 2 * GB || m.used < 0.05 * GB;
  const div = useMB ? MB : GB;
  const unit = useMB ? "MB" : "GB";
  const dec = useMB ? 0 : 1;

  const used = (m.used / div).toFixed(dec);
  const total = (m.total / div).toFixed(dec);

  return {
    percent,
    sub: `${used} / ${total} ${unit}`,
  };
}
