"use client";

import { ContainerStateEnum, type Image } from "@containers/shared";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LayersIcon,
  Trash2Icon,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/core/card";
import { ImagesTable } from "@/components/images/table/data-table";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useImagesStore } from "@/lib/store/images.store";
import { ContainerStateBadge } from "../containers/container-state-badge";
import { MetricInfo } from "../core/metric-info";
import { columns } from "./table/columns";

export function ImagesSection() {
  const images = useImagesStore((state) => state.images);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: images,
    columns,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
  });

  return (
    <div className="grid flex-1 grid-cols-3 gap-3">
      <Card className="col-span-2 flex-1">
        <CardToolbar>
          <div className="inline-flex items-baseline gap-2">
            <h2>Your Images</h2>
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <span>
                {table.getFilteredSelectedRowModel().rows.length}&nbsp;/&nbsp;
                {table.getFilteredRowModel().rows.length} selected
              </span>
            ) : (
              <span>{images.length} images</span>
            )}
          </div>

          {table.getFilteredSelectedRowModel().rows.length && (
            <Button size="icon-sm" variant="ghost">
              <Trash2Icon />
            </Button>
          )}
        </CardToolbar>

        <CardContent className="flex-1 p-0">
          <ImagesTable columns={columns} table={table} />
        </CardContent>

        <CardFooter className="justify-between">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue data-placeholder="Select page size" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="page_size_10">10 per page</SelectItem>
              <SelectItem value="page_size_20">20 per page</SelectItem>
              <SelectItem value="page_size_50">50 per page</SelectItem>
            </SelectContent>
          </Select>

          <div className="inline-flex items-center gap-2">
            <Button size="icon-sm" variant="ghost">
              <ChevronLeftIcon />
            </Button>

            <span className="font-mono">1</span>

            <Button size="icon-sm" variant="ghost">
              <ChevronRightIcon />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ImageDetailCard />
    </div>
  );
}

function ImageDetailCard() {
  const image = useImagesStore((state) => state.activeImage);

  if (image === null) {
    return <EmptyImageCard />;
  }

  return (
    <Card className="h-min">
      <CardToolbar>
        <span className="font-mono">
          {image.id.replace("sha256:", "").slice(0, 12)}
        </span>

        <div className="inline-flex items-center gap-1">
          <Button size="icon-sm" variant="ghost">
            <Trash2Icon />
          </Button>

          <Button size="icon-sm" variant="ghost">
            <EllipsisVerticalIcon />
          </Button>
        </div>
      </CardToolbar>

      <div className="flex flex-col gap-3">
        <CardContent>
          <CardHeader>
            <div className="inline-flex w-full items-center justify-between">
              <CardTitle>{image.name}</CardTitle>

              <span className="text-muted-foreground">No Vulnerabilities</span>
            </div>

            <CardDescription>{image.tags.at(0)}</CardDescription>
          </CardHeader>

          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <MetricInfo label="Size" value={prettyBytes(image.size)} />
            <MetricInfo
              label="Architecture"
              value={`${image.os}/${image.architecture}`}
            />
            <MetricInfo label="Layers" value={String(image.layers) || "-"} />
            <MetricInfo label="Registry" value="Docker Hub" />
          </div>
        </CardContent>

        <CardContent>
          <CardHeader>
            <div className="inline-flex w-full items-center justify-between">
              <CardTitle>Containers</CardTitle>

              <span className="text-muted-foreground">
                {getContainersState(image.containers)}
              </span>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-3">
            {image.containers.map((container) => (
              <div
                className="inline-flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 p-2"
                key={container.id}
              >
                <h3>{container.name}</h3>
                <ContainerStateBadge state={container.state} />
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      <CardFooter className="justify-between">
        <span>{prettyBytes(image.size)}</span>
        <span>core</span>
      </CardFooter>
    </Card>
  );
}

function EmptyImageCard() {
  return (
    <Card className="h-min">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LayersIcon />
          </EmptyMedia>
          <EmptyTitle>No Image Selected</EmptyTitle>
          <EmptyDescription className="max-w-3xs">
            Select an image from the table to view its details.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </Card>
  );
}

function getContainersState(containers: Image["containers"]) {
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

  const result: Array<string> = [];

  if (state[ContainerStateEnum.running] > 0) {
    result.push(`${state[ContainerStateEnum.running]} running`);
  }

  if (state[ContainerStateEnum.paused] > 0) {
    result.push(`${state[ContainerStateEnum.paused]} paused`);
  }

  if (state[ContainerStateEnum.exited] > 0) {
    result.push(`${state[ContainerStateEnum.exited]} exited`);
  }

  return result.join(" / ");
}
