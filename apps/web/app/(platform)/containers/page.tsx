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
import { ContainerCard } from "@/components/containers/container-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { logger } from "@/lib/logger";
import { listContainers } from "@/lib/services/containers.service";
import { MetricsStreamController } from "@/components/containers/metrics-stream-controller";

export default async function Page() {
  const { data, error } = await listContainers();
  if (error) {
    logger.error(error);
    throw new Error("error getting containers");
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <MetricsStreamController />
      <section className="flex w-full flex-col gap-3 rounded-lg border border-neutral-100 bg-background p-3">
        <div className="inline-flex w-full items-center justify-between">
          <div className="inline-flex items-baseline gap-2">
            <h2>Containers</h2>
            <span className="text-muted-foreground text-xs">8 nodes</span>
          </div>

          <ToggleGroup className="gap-1 bg-neutral-50 p-0.5 font-mono">
            <ToggleGroupItem className="aria-pressed:border! border! rounded-sm! border-transparent! bg-transparent aria-pressed:border-neutral-100! aria-pressed:bg-white!">
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
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <CpuIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                CPU
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">32.5%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  12 vCPU
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={32.5} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <MemoryStickIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                Memory
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">93.8%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  32 GB
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={93.8} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <HardDriveIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                Disk
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">74.2%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  512 GB
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={74.2} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <NetworkIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                Network
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-medium font-mono text-neutral-700">
                <div className="inline-flex items-center gap-1">
                  <ArrowUpIcon className="size-3.5" />
                  <span>3.7 Gbps</span>
                </div>

                <div className="inline-flex items-center gap-1">
                  <span>0.7 Gbps</span>
                  <ArrowDownIcon className="size-3.5" />
                </div>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={80} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="@container flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden rounded-lg border border-neutral-100 bg-background p-3">
        <div className="inline-flex w-full items-center justify-between px-3">
          <div className="inline-flex items-baseline gap-2">
            <h2>Containers</h2>
            <span className="text-muted-foreground text-xs">8 nodes</span>
          </div>

          <div className="inline-flex items-center gap-3">
            <Button size="icon-sm" variant="ghost">
              <ArrowDownUpIcon />
            </Button>

            <Button size="icon-sm" variant="ghost">
              <FunnelIcon />
            </Button>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="grid @7xl:grid-cols-4 grid-cols-3 gap-4">
            {data.map((container) => (
              <ContainerCard container={container} key={container.id} />
            ))}
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
