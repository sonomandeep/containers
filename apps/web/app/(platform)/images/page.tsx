import {
  AlertTriangleIcon,
  ArchiveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardToolbar,
} from "@/components/core/card";
import {
  MetricCard,
  MetricCardContent,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardProgress,
  MetricCardStats,
  MetricCardValue,
} from "@/components/core/metric-card";
import {
  SectionCard,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardMeta,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
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
import { listImages } from "@/lib/services/images.service";

export default async function Page() {
  const { data, error } = await listImages();

  if (error !== null) {
    throw new Error(error);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <SectionCard>
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Cluster Images</SectionCardTitle>
            <SectionCardDescription>
              {data.length} Images
            </SectionCardDescription>
          </SectionCardHeaderContent>

          <SectionCardMeta>
            {(
              data.reduce((acc, image) => acc + image.size, 0) /
              1024 ** 3
            ).toFixed(2)}
            &nbsp;GB
          </SectionCardMeta>
        </SectionCardHeader>

        <div className="grid grid-cols-3 gap-4">
          <MetricCard>
            <MetricCardHeader>
              <LayersIcon />
              In Use
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>16</MetricCardValue>
                <MetricCardLabel>224 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={59.25} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <ArchiveIcon />
              Unused
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>7</MetricCardValue>
                <MetricCardLabel>98 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar
                  activeClassName="bg-amber-500"
                  value={25.92}
                />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <AlertTriangleIcon />
              Dangling
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>4</MetricCardValue>
                <MetricCardLabel>56 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar
                  activeClassName="bg-red-500"
                  value={14.81}
                />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>
        </div>
      </SectionCard>

      <SectionCard className="@container min-h-0 flex-1 overflow-hidden">
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Your Images</SectionCardTitle>
          </SectionCardHeaderContent>
        </SectionCardHeader>

        <div className="grid flex-1 grid-cols-3 gap-3">
          <Card className="col-span-2 flex-1">
            <CardToolbar>{data.length}</CardToolbar>

            <CardContent className="flex-1">aaa</CardContent>

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
        </div>
      </SectionCard>
    </div>
  );
}
