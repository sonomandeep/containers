"use client";

import type { Container, ContainerPort } from "@containers/shared";
import { format, formatDistanceToNow } from "date-fns";
import {
  ActivityIcon,
  BoxIcon,
  CalendarIcon,
  ChevronLeftIcon,
  HashIcon,
  Layers2Icon,
  NetworkIcon,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContainerPortBadge } from "@/components/ui/container-port-badge";
import { ContainerStateBadge } from "@/components/ui/container-state-badge";
import { InfoCard, InfoCardRow } from "@/components/ui/info-card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Props {
  container: Container;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerSheet({ container, open, onOpenChange }: Props) {
  const createdLabel = format(container.created * 1000, "eee dd MMM yyyy");

  const renderPorts = (ports: ContainerPort[]) => {
    if (!ports.length) {
      return (
        <Badge variant="outline" className="font-mono">
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
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="flex items-center px-4 h-[53px] border-b border-secondary">
          <div className="inline-flex items-center">
            <div className="inline-flex items-center gap-2">
              <SheetClose asChild>
                <Button size="icon-xs" variant="ghost">
                  <ChevronLeftIcon className="size-3.5 opacity-60" />
                </Button>
              </SheetClose>

              <div className="h-6 bg-neutral-100 inline-flex items-center gap-1.5 px-2 rounded-md">
                <BoxIcon className="size-3.5 opacity-60" />
                <span className="text-sm text-muted-foreground">
                  {container.id.slice(0, 12)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <SheetHeader className="border-b border-secondary flex-row items-center gap-4">
          <div className="bg-secondary size-10 rounded-md" />

          <div className="flex-col items-center">
            <SheetTitle>{container.name}</SheetTitle>

            <SheetDescription>
              Created&nbsp;
              {formatDistanceToNow(container.created * 1000, {
                addSuffix: true,
              })}
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="p-4 border-b border-secondary">
          <InfoCard>
            <InfoCardRow icon={HashIcon} label="ID">
              <p className="font-mono">{container.id.slice(0, 12)}</p>
            </InfoCardRow>

            <InfoCardRow icon={BoxIcon} label="Name">
              <p>{container.name}</p>
            </InfoCardRow>

            <InfoCardRow icon={Layers2Icon} label="Image">
              <Link href={`/images/${container.image}`}>
                <Badge variant="secondary" className="inline-flex gap-2">
                  <Layers2Icon className="opacity-60 size-3.5" />
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

        <SheetFooter className="border-t border-secondary p-2">
          <div className="inline-flex items-center justify-end">
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
