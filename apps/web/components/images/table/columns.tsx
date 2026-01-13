"use client";

import type { Image } from "@containers/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  BoxIcon,
  CpuIcon,
  HardDriveIcon,
  LayersIcon,
  TagsIcon,
} from "lucide-react";
import { ContainersState } from "../containers-state";
import prettyBytes from "pretty-bytes";

export const columns: Array<ColumnDef<Image>> = [
  {
    accessorKey: "name",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <LayersIcon />
        Name
      </div>
    ),
    cell: ({ row }) => {
      const tags = row.original.repoTags;
      const name = tags?.at(0);

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
      const tags = row.original.repoTags as Array<string>;

      return <>{tags.map((tag) => tag)}</>;
    },
  },
  {
    accessorKey: "arch",
    header: () => (
      <div className="inline-flex items-center gap-1.5">
        <CpuIcon />
        Architecture
      </div>
    ),
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

      return <ContainersState state={containers} />;
    },
  },
];
