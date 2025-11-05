"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActivityIcon, BoxIcon, CalendarIcon, LayersIcon, NetworkIcon, PlayIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface Container {
  id: string;
  name: string;
  image: string;
  status: "Running" | "Exited";
  ports: string;
  created: Date;
}

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
    size: 40,
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
      <div className="truncate max-w-[160px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <LayersIcon className="size-3.5" />
          Image
        </div>
      );
    },
    cell: ({ row }) => (
      <div className="truncate max-w-[180px]">
        {row.getValue("image")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => {
      return (
        <div className="inline-flex items-center gap-2">
          <ActivityIcon className="size-3.5" />
          Status
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue<Container["status"]>("status");

      switch (status) {
        case "Running":
          return (
            <Badge
              variant="success"
            >
              <PlayIcon />
              {status}
            </Badge>
          );

        case "Exited":
          return (
            <Badge
              variant="destructive"
            >
              <SquareIcon />
              {status}
            </Badge>
          );
      }
    },
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
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("ports")}
      </Badge>
    ),
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
      const date = row.getValue<Date>("created");
      return (
        <div>
          {format(date, "eee dd dd MMM yyyy")}
        </div>
      );
    },
  },
];
