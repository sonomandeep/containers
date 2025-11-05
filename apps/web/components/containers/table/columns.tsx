"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActivityIcon, BoxIcon, CalendarIcon, Layers2Icon, NetworkIcon, PlayIcon, SquareIcon } from "lucide-react";
import Link from "next/link";
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
    size: 50,
    minSize: 50,
    maxSize: 50,
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
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.getValue("ports")}
      </Badge>
    ),
    size: 200,
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
      const date = row.getValue<Date>("created");
      return (
        <div>
          {format(date, "eee dd MMM yyyy")}
        </div>
      );
    },
    size: 200,
  },
];
