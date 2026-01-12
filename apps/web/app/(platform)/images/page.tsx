import {
  AlertTriangleIcon,
  ArchiveIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LayersIcon,
} from "lucide-react";
import {
  SectionCard,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardMeta,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
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
  Card,
  CardContent,
  CardFooter,
  CardToolbar,
} from "@/components/core/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <SectionCard>
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Cluster Images</SectionCardTitle>
            <SectionCardDescription>37 images</SectionCardDescription>
          </SectionCardHeaderContent>

          <SectionCardMeta>376 GB</SectionCardMeta>
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

        <div className="grid gap-3 flex-1 grid-cols-3">
          <Card className="flex-1 col-span-2">
            <CardToolbar>27 images</CardToolbar>

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

              <div className="inline-flex gap-2 items-center">
                <Button variant="ghost" size="icon-sm">
                  <ChevronLeftIcon />
                </Button>

                <span className="font-mono">1</span>

                <Button variant="ghost" size="icon-sm">
                  <ChevronRightIcon />
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="h-min">aaa</Card>
        </div>
      </SectionCard>
    </div>
  );
}
