"use client";

import type {
  Container,
  ContainerMetrics,
  ContainerPort,
} from "@containers/shared";
import {
  EllipsisVerticalIcon,
  FileTextIcon,
  FolderKeyIcon,
  HardDriveIcon,
  NetworkIcon,
  RotateCwIcon,
  SquareIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContainerPortBadge } from "./container-port-badge";
import { ContainerStateBadge } from "./container-state-badge";
import { useContainersStore } from "@/lib/store/containers.store";

type Props = {
  container: Container;
};

export function ContainerCard({ container }: Props) {
  const containers = useContainersStore((state) => state.containers);

  return (
    <Card key={container.id}>
      <CardToolbar>
        <span className="font-mono">{container.id.slice(0, 12)}</span>

        <div className="inline-flex items-center gap-1">
          <Button size="icon-sm" variant="ghost">
            <SquareIcon />
          </Button>

          <Button size="icon-sm" variant="ghost">
            <RotateCwIcon />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="icon-sm" variant="ghost" />}
            >
              <EllipsisVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileTextIcon />
                Logs
              </DropdownMenuItem>
              <DropdownMenuItem>
                <NetworkIcon />
                Ports
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderKeyIcon />
                Variables
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HardDriveIcon />
                Volumes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SquareTerminalIcon />
                Terminal
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2Icon />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            value={`${getContainerMetrics(container.id, containers).cpu} %`}
          />
          <ContainerMetric
            label="Memory"
            value={`${getContainerMetrics(container.id, containers).memory.percent} %`}
          />
          <ContainerMetric label="Network" value="-" />
          <ContainerMetric label="Disk I/O" value="-" />
        </div>

        <ContainerPorts ports={container.ports} />
      </CardContent>

      <CardFooter className="justify-between">
        <span>{container.status}</span>
        <span>Node</span>
      </CardFooter>
    </Card>
  );
}

function getContainerMetrics(
  id: string,
  containers: Array<Container>
): ContainerMetrics {
  const current = containers.find((item) => item.id === id);
  if (!current?.metrics) {
    return {
      cpu: "-",
      memory: {
        usage: "-",
        limit: "-",
        percent: "-",
      },
    };
  }

  return current.metrics;
}

function ContainerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full flex-col">
      <span className="text-muted-foreground">{label}</span>
      <p className="font-medium text-neutral-700 text-sm">{value}</p>
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
