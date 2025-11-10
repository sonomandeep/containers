"use client";

import type { Image } from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  BoxIcon,
  CalendarIcon,
  HardDriveIcon,
  HashIcon,
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

const containerStateMeta = {
  running: {
    label: "Running",
    dotClass: "bg-green-500",
  },
  paused: {
    label: "Paused",
    dotClass: "bg-orange-500",
  },
  exited: {
    label: "Exited",
    dotClass: "bg-red-500",
  },
} as const;

const EMPTY_CONTAINERS_STATE: Image["containers"] = {
  running: 0,
  paused: 0,
  exited: 0,
};

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
        <HashIcon className="size-3.5" />
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
    size: 200,
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
    size: 200,
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

      const [primary, ...rest] = tags;

      return (
        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          <Badge variant="outline" className="font-mono truncate">
            {primary}
          </Badge>

          {rest.length > 0 && (
            <Badge variant="outline" className="font-mono">
              <span>+</span>
              {rest.length}
            </Badge>
          )}
        </div>
      );
    },
    size: 200,
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
    size: 200,
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
      const containers =
        row.getValue<Image["containers"]>("containers") ??
        EMPTY_CONTAINERS_STATE;

      return <ContainerStateBadges state={containers} />;
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
      const created = row.getValue<number>("created");

      return <div>{format(created * 1000, "eee dd MMM yyyy")}</div>;
    },
    size: 200,
  },
];

type ContainerStateKey = keyof typeof containerStateMeta;

function ContainerStateBadges({ state }: { state: Image["containers"] }) {
  const items = (Object.keys(containerStateMeta) as Array<ContainerStateKey>)
    .map((key) => ({
      key,
      count: state[key],
      ...containerStateMeta[key],
    }))
    .filter((item) => item.count > 0);

  if (!items.length) {
    return (
      <Badge variant="outline" className="font-mono text-muted-foreground">
        0
      </Badge>
    );
  }

  return (
    <div className="inline-flex flex-wrap gap-2">
      {items.map(({ key, count, label, dotClass }) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="gap-1.5">
              <span
                className={`size-1.5 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <span className="font-mono">{count}</span>
              <span className="sr-only">{label}</span>
            </Badge>
          </TooltipTrigger>

          <TooltipContent>
            <span className="text-xs font-medium">{label}</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
