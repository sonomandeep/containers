"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, PlayIcon, SquareIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[160px]">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="text-muted-foreground truncate max-w-[180px]">
        {row.getValue("image")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
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
    header: "Ports",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
        {row.getValue("ports")}
      </Badge>
    ),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue<Date>("created");
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "eee dd dd MMM yyyy")}
        </div>
      );
    },
  },
];
