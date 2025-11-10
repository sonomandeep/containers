"use client";

import type { Container, ContainerPort, ContainerState } from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActivityIcon, BoxIcon, CalendarIcon, HashIcon, Layers2Icon, NetworkIcon, PlayIcon, SquareIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const columns: ColumnDef<Container>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <HashIcon className="size-3.5" />
          ID
        </div>
      );
    },
    cell: ({ row }) => {
      const id = row.getValue<string>("id");

      return (
        <Tooltip>
          <TooltipTrigger>
            {id.slice(
              0,
              12,
            )}
          </TooltipTrigger>

          <TooltipContent side="right">
            <p>{id}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 200,
  },
  {
    accessorKey: "name",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <BoxIcon className="size-3.5" />
          Name
        </div>
      );
    },
    cell: ({ row }) => (
      <div>
        {row.getValue("name")}
      </div>
    ),
    size: 200,
  },
  {
    accessorKey: "image",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <Layers2Icon className="size-3.5" />
          Image
        </div>
      );
    },
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
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <NetworkIcon className="size-3.5" />
          Ports
        </div>
      );
    },
    cell: ({ row }) => {
      const ports = row.getValue<Array<ContainerPort>>("ports");

      if (ports.length === 0) {
        return (
          <Badge variant="outline" className="font-mono">
            -
          </Badge>
        );
      }

      return (
        <div className="inline-flex gap-2">
          {ports.map((port) => (
            <Badge key={`${port.publicPort}:${port.privatePort}`} variant="outline" className="font-mono">
              {`${port.publicPort}:${port.privatePort}`}
            </Badge>
          ))}
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "state",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <ActivityIcon className="size-3.5" />
          Status
        </div>
      );
    },
    cell: ({ row }) => {
      const state = row.getValue<ContainerState>("state");

      switch (state) {
        case "running":
          return (
            <Badge
              variant="success"
            >
              <PlayIcon />
              Running
            </Badge>
          );

        case "exited":
          return (
            <Badge
              variant="destructive"
            >
              <SquareIcon />
              Exited
            </Badge>
          );
      }
    },
    size: 200,
  },
  {
    accessorKey: "created",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <CalendarIcon className="size-3.5" />
          Created
        </div>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue<number>("created");

      return (
        <div>
          {format(date * 1000, "eee dd MMM yyyy")}
        </div>
      );
    },
    size: 200,
  },
];
