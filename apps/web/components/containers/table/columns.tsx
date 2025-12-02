"use client";

import type {
  Container,
  ContainerPort,
  ContainerState,
} from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ContainerPortBadge } from "@/components/ui/container-port-badge";
import { ContainerStateBadge } from "@/components/ui/container-state-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ContainerActionsDropdown from "./actions-dropdown";

export const columns: ColumnDef<Container>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 36,
    minSize: 36,
    maxSize: 36,
  },
  {
    accessorKey: "id",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <HashIcon className="size-3.5" />
        ID
      </div>
    ),
    cell: ({ row }) => {
      const id = row.getValue<string>("id");

      return (
        <Tooltip>
          <TooltipTrigger>{id.slice(0, 12)}</TooltipTrigger>

          <TooltipContent side="right">{id}</TooltipContent>
        </Tooltip>
      );
    },
    size: 200,
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <BoxIcon className="size-3.5" />
        Name
      </div>
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
    size: 200,
  },
  {
    accessorKey: "image",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <Layers2Icon className="size-3.5" />
        Image
      </div>
    ),
    cell: ({ row }) => (
      <Link href={`/images/${row.getValue("image")}`}>
        <Badge variant="secondary">
          <Layers2Icon className="opacity-60" />
          {row.getValue("image")}
        </Badge>
      </Link>
    ),
    size: 200,
  },
  {
    accessorKey: "ports",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <NetworkIcon className="size-3.5" />
        Ports
      </div>
    ),
    cell: ({ row }) => {
      const ports = row.getValue<Array<ContainerPort>>("ports");

      if (ports.length === 0) {
        return (
          <Badge className="font-mono" variant="outline">
            -
          </Badge>
        );
      }

      return (
        <div className="inline-flex gap-2">
          {ports.map((port) => (
            <ContainerPortBadge
              key={`${port.ip}-${port.publicPort}-${port.privatePort}`}
              port={port}
            />
          ))}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "state",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <ActivityIcon className="size-3.5" />
        Status
      </div>
    ),
    cell: ({ row }) => {
      const state = row.getValue<ContainerState>("state");

      return state ? <ContainerStateBadge state={state} /> : null;
    },
    size: 200,
  },
  {
    accessorKey: "created",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <CalendarIcon className="size-3.5" />
        Created
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue<number>("created");

      return <div>{format(date * 1000, "eee dd MMM yyyy")}</div>;
    },
    size: 200,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ContainerActionsDropdown container={row.original} />
      </div>
    ),
    size: 80,
    minSize: 64,
    maxSize: 92,
    enableSorting: false,
    enableHiding: false,
  },
];
