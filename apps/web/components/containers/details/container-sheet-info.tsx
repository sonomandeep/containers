"use client";

import type { Container, ContainerPort } from "@containers/shared";
import {
  ActivityIcon,
  BoxIcon,
  CalendarIcon,
  HashIcon,
  Layers2Icon,
  NetworkIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ContainerPortBadge } from "@/components/ui/container-port-badge";
import { ContainerStateBadge } from "@/components/ui/container-state-badge";
import { InfoCard, InfoCardRow } from "@/components/ui/info-card";

type Props = {
  container: Container;
  createdLabel: string;
};

export function ContainerSheetInfo({ container, createdLabel }: Props) {
  return (
    <div className="border-secondary border-b p-4">
      <InfoCard>
        <InfoCardRow icon={HashIcon} label="ID">
          <p className="font-mono">{container.id.slice(0, 12)}</p>
        </InfoCardRow>

        <InfoCardRow icon={BoxIcon} label="Name">
          <p>{container.name}</p>
        </InfoCardRow>

        <InfoCardRow icon={Layers2Icon} label="Image">
          <Link href={`/images/${container.image}`}>
            <Badge className="inline-flex gap-2" variant="secondary">
              <Layers2Icon className="size-3.5 opacity-60" />
              {container.image}
            </Badge>
          </Link>
        </InfoCardRow>

        <InfoCardRow icon={NetworkIcon} label="Ports">
          {renderPorts(container.ports)}
        </InfoCardRow>

        <InfoCardRow icon={ActivityIcon} label="Status">
          <ContainerStateBadge state={container.state} />
        </InfoCardRow>

        <InfoCardRow icon={CalendarIcon} label="Created">
          <p>{createdLabel}</p>
        </InfoCardRow>
      </InfoCard>
    </div>
  );
}

function renderPorts(ports: Array<ContainerPort>) {
  if (!ports.length) {
    return (
      <Badge className="font-mono" variant="outline">
        -
      </Badge>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ports.map((port) => (
        <ContainerPortBadge
          key={`${port.ip}-${port.publicPort}-${port.privatePort}`}
          port={port}
        />
      ))}
    </div>
  );
}
