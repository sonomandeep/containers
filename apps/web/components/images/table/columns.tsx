"use client";

import type { Image } from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  BadgeCheckIcon,
  BoxIcon,
  CalendarIcon,
  FingerprintIcon,
  HardDriveIcon,
  Layers2Icon,
  TagIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatBytes } from "@/lib/utils";

export const columns: ColumnDef<Image>[] = [
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
    header: () => (
      <div className="inline-flex items-center gap-2">
        <FingerprintIcon className="size-3.5" />
        ID
      </div>
    ),
    cell: ({ row }) => {
      const id = row.getValue<string>("id");

      return (
        <Tooltip>
          <TooltipTrigger>{id.slice(7, 19)}</TooltipTrigger>

          <TooltipContent side="right">
            <p>{id}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 160,
  },
  {
    id: "repository",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <Layers2Icon className="size-3.5" />
        Repository
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.original.repoTags;
      const primary = tags.at(0) ?? "untagged:latest";

      return (
        <Badge variant="secondary" className="gap-2">
          <Layers2Icon className="size-3 opacity-60" />
          {primary}
        </Badge>
      );
    },
    size: 220,
  },
  {
    accessorKey: "repoTags",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <TagIcon className="size-3.5" />
        Tags
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.getValue<Array<string>>("repoTags");

      if (!tags.length) {
        return (
          <Badge variant="outline" className="font-mono">
            none
          </Badge>
        );
      }

      return (
        <div className="inline-flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="font-mono">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="secondary" className="font-mono">
              +
              {tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
    size: 240,
  },
  {
    accessorKey: "size",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <HardDriveIcon className="size-3.5" />
        Size
      </div>
    ),
    cell: ({ row }) => {
      const size = row.getValue<number>("size");

      return <span className="font-mono">{formatBytes(size)}</span>;
    },
    size: 120,
  },
  {
    accessorKey: "containers",
    header: () => (
      <div className="inline-flex items-center gap-2">
        <BoxIcon className="size-3.5" />
        Containers
      </div>
    ),
    cell: ({ row }) => {
      const containers = row.getValue<number>("containers");

      return (
        <Badge variant="outline" className="font-mono">
          {containers}
        </Badge>
      );
    },
    size: 140,
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
      const created = row.getValue<number>("created");

      return (
        <div className="inline-flex items-center gap-2">
          <BadgeCheckIcon className="size-3 opacity-60" />
          {format(created * 1000, "eee dd MMM yyyy")}
        </div>
      );
    },
    size: 200,
  },
];
