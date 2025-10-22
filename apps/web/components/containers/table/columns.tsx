"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
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
      return (
        <Badge
          variant={status === "Running" ? "default" : "secondary"}
          className={
            status === "Running"
              ? "bg-green-500/10 text-green-600"
              : "bg-zinc-500/10 text-zinc-600"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "ports",
    header: "Ports",
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.getValue("ports")}
      </div>
    ),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue<Date>("created");
      return (
        <div className="text-sm text-muted-foreground">
          {format(date, "dd MMM yyyy HH:mm")}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
];
