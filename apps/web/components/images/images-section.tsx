"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LayersIcon,
  Trash2Icon,
} from "lucide-react";
import prettyBytes from "pretty-bytes";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/core/card";
import { ImagesTable } from "@/components/images/table";
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
import { MetricInfo } from "../core/metric-info";
import { ContainerStateBadge } from "../containers/container-state-badge";
import { ContainerStateEnum } from "@containers/shared";

export function ImagesSection() {
  const images = useImagesStore((state) => state.images);

  return (
    <div className="grid flex-1 grid-cols-3 gap-3">
      <Card className="col-span-2 flex-1">
        <CardToolbar>{images.length} images</CardToolbar>

        <CardContent className="flex-1 p-0">
          <ImagesTable images={images} />
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
              <CardTitle>{image.repoTags.at(0)}</CardTitle>

              <span className="text-muted-foreground">No Vulnerabilities</span>
            </div>
          </CardHeader>

          <div className="grid grid-cols-2 grid-rows-2 gap-3">
            <MetricInfo label="Size" value={prettyBytes(image.size)} />
            <MetricInfo label="Architecture" value="linux/amd64" />
            <MetricInfo label="Layers" value="7" />
            <MetricInfo label="Registry" value="Docker Hub" />
          </div>
        </CardContent>

        <CardContent>
          <CardHeader>
            <div className="inline-flex w-full items-center justify-between">
              <CardTitle>Containers</CardTitle>

              <span className="text-muted-foreground">
                3 running / 1 stopped
              </span>
            </div>
          </CardHeader>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-2">
            <div className="inline-flex items-center justify-between">
              <h3>API Gateway</h3>
              <ContainerStateBadge state={ContainerStateEnum.running} />
            </div>
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
