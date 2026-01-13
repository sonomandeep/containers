"use client";

import { ContainerStateEnum, type Image } from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BoxIcon,
  CpuIcon,
  HardDriveIcon,
  LayersIcon,
  TagsIcon,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import { ContainersState } from "../containers-state";
import { Checkbox } from "@/components/ui/checkbox";

export const columns: Array<ColumnDef<Image>> = [
  {
    id: "select",
    size: 50,
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
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <LayersIcon />
        Name
      </div>
    ),
    cell: ({ row }) => {
      const name = row.original.name;

      return <p>{name}</p>;
    },
  },
  {
    accessorKey: "tags",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <TagsIcon />
        Tags
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.original.tags;

      return <>{tags.map((tag) => tag)}</>;
    },
  },
  {
    accessorKey: "architecture",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <CpuIcon />
        Architecture
      </div>
    ),
    cell: ({ row }) => {
      const os = row.original.os;
      const architecture = row.original.architecture;

      return <p className="font-mono">{`${os}/${architecture}`}</p>;
    },
  },
  {
    accessorKey: "size",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <HardDriveIcon />
        Size
      </div>
    ),
    cell({ row }) {
      const sizeInBytes = row.original.size;

      return <p className="font-mono">{prettyBytes(sizeInBytes)}</p>;
    },
  },
  {
    accessorKey: "containers",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <BoxIcon />
        Containers
      </div>
    ),
    cell({ row }) {
      const containers = row.original.containers;
      const state = {
        [ContainerStateEnum.running]: 0,
        [ContainerStateEnum.paused]: 0,
        [ContainerStateEnum.exited]: 0,
      };

      for (const container of containers) {
        if (
          container.state === ContainerStateEnum.running ||
          container.state === ContainerStateEnum.paused ||
          container.state === ContainerStateEnum.exited
        ) {
          state[container.state] += 1;
        }
      }

      return <ContainersState state={state} />;
    },
  },
];
