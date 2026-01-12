import {
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  CpuIcon,
  FunnelIcon,
  HardDriveIcon,
  MemoryStickIcon,
  NetworkIcon,
} from "lucide-react";
import { ContainersGrid } from "@/components/containers/containers-grid";
import { MetricsStreamController } from "@/components/containers/metrics-stream-controller";
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
  SectionCardActions,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { logger } from "@/lib/logger";
import { listContainers } from "@/lib/services/containers.service";

export default async function Page() {
  const { data, error } = await listContainers();
  if (error) {
    logger.error(error);
    throw new Error("error getting containers");
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <MetricsStreamController containers={data} />

      <SectionCard>
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Cluster Resources</SectionCardTitle>
            <SectionCardDescription>3 node</SectionCardDescription>
          </SectionCardHeaderContent>

          <SectionCardActions>
            <ToggleGroup
              className="gap-1 bg-neutral-50 p-0.5 font-mono"
              defaultValue={["1h"]}
            >
              <ToggleGroupItem
                className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!"
                value="1h"
              >
                1h
              </ToggleGroupItem>
              <ToggleGroupItem className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!">
                4h
              </ToggleGroupItem>
              <ToggleGroupItem className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!">
                1d
              </ToggleGroupItem>
              <ToggleGroupItem className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!">
                7d
              </ToggleGroupItem>
              <ToggleGroupItem className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!">
                30d
              </ToggleGroupItem>
            </ToggleGroup>
          </SectionCardActions>
        </SectionCardHeader>

        <div className="grid grid-cols-4 gap-4">
          <MetricCard>
            <MetricCardHeader>
              <CpuIcon />
              CPU
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>32.5%</MetricCardValue>
                <MetricCardLabel>12 vCPU</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={32.5} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <MemoryStickIcon />
              Memory
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>93.8%</MetricCardValue>
                <MetricCardLabel>32 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={93.8} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <HardDriveIcon />
              Disk
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>74.2%</MetricCardValue>
                <MetricCardLabel>512 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={74.2} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <NetworkIcon />
              Network
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>
                  <div className="inline-flex items-center gap-1">
                    <ArrowUpIcon className="size-3.5" />
                    <span>3.7 Gbps</span>
                  </div>
                </MetricCardValue>
                <MetricCardValue>
                  <div className="inline-flex items-center gap-1">
                    <span>0.7 Gbps</span>
                    <ArrowDownIcon className="size-3.5" />
                  </div>
                </MetricCardValue>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={80} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>
        </div>
      </SectionCard>

      <SectionCard className="@container min-h-0 flex-1 overflow-hidden">
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Your Containers</SectionCardTitle>
            <SectionCardDescription>
              {data.length} containers
            </SectionCardDescription>
          </SectionCardHeaderContent>

          <SectionCardActions>
            <Button size="icon-sm" variant="ghost">
              <ArrowDownUpIcon />
            </Button>

            <Button size="icon-sm" variant="ghost">
              <FunnelIcon />
            </Button>
          </SectionCardActions>
        </SectionCardHeader>

        <ContainersGrid />
      </SectionCard>
    </div>
  );
}
