"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LayersIcon,
  Trash2Icon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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

      <CardContent>
        <CardHeader>
          <div className="inline-flex w-full items-center justify-between">
            <CardTitle>{image.repoTags.at(0)}</CardTitle>
          </div>

          <CardDescription>{image.repoTags.at(0)}</CardDescription>
        </CardHeader>
      </CardContent>

      <CardFooter className="justify-between">
        <span>{image.size}</span>
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
