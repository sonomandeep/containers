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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Page() {
  return (
    <div className="flex h-full flex-col gap-3">
      <section className="flex w-full flex-col gap-3 rounded-xl border border-neutral-100 bg-background p-3">
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

      <section className="@container flex h-full w-full flex-1 flex-col gap-3 rounded-lg bg-background p-3">
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

        <div className="grid @7xl:grid-cols-4 grid-cols-3 gap-4">
          {containers.services.map((container) => (
            <ContainerCard container={container as any} key={container.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

const containers = {
  services: [
    {
      id: "a3f1c9e4b7d2",
      name: "API Gateway",
      image: "nginx:latest",
      status: "RUNNING",
      cpu_percent: 38.2,
      memory_mb: 295.4,
      network_kbps: 842.6,
      disk_io_mb: { read: 102, write: 21 },
      ports: [
        { protocol: "IPv4", host_port: 80, container_port: 80 },
        { protocol: "IPv4", host_port: 443, container_port: 443 },
      ],
      uptime: "3 days 4 hours",
      environment: "prod-us-east-1",
    },
    {
      id: "b7d21f9c4a3e",
      name: "Auth Service",
      image: "node:20-alpine",
      status: "RESTARTING",
      cpu_percent: 22.9,
      memory_mb: 181.7,
      network_kbps: 312.4,
      disk_io_mb: { read: 48, write: 9 },
      ports: [{ protocol: "IPv4", host_port: 8080, container_port: 8080 }],
      uptime: "7 days 1 hour",
      environment: "prod-us-east-1",
    },
    {
      id: "c91e7a4d2f88",
      name: "User Service",
      image: "python:3.12-slim",
      status: "RUNNING",
      cpu_percent: 55.6,
      memory_mb: 412.3,
      network_kbps: 1204.9,
      disk_io_mb: { read: 189, write: 46 },
      ports: [{ protocol: "IPv4", host_port: 9000, container_port: 9000 }],
      uptime: "1 day 6 hours",
      environment: "prod-eu-west-1",
    },
    {
      id: "d4e8f1a92c6b",
      name: "Orders Service",
      image: "java:21-jre",
      status: "STOPPED",
      cpu_percent: 68.1,
      memory_mb: 768.5,
      network_kbps: 1543.2,
      disk_io_mb: { read: 321, write: 97 },
      ports: [{ protocol: "IPv4", host_port: 9100, container_port: 9100 }],
      uptime: "12 hours",
      environment: "prod-us-west-2",
    },
    {
      id: "e2a6c9b8d713",
      name: "Metrics Collector",
      image: "prom/prometheus:latest",
      status: "RUNNING",
      cpu_percent: 14.7,
      memory_mb: 256.1,
      network_kbps: 198.3,
      disk_io_mb: { read: 76, write: 12 },
      ports: [{ protocol: "IPv4", host_port: 9090, container_port: 9090 }],
      uptime: "15 days 9 hours",
      environment: "prod-us-east-1",
    },
  ],
};
