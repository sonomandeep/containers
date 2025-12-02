"use client";

import type { Container } from "@containers/shared";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownUpIcon,
  GaugeIcon,
  HardDriveIcon,
  MemoryStickIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn, formatBytes } from "@/lib/utils";

type Props = {
  metrics?: Container["metrics"];
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: temp
export function ContainerSheetMetrics({ metrics }: Props) {
  const isMetricValue = (value: number | null | undefined): value is number =>
    typeof value === "number" && Number.isFinite(value);
  const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
  const bytesToMegabytes = (value: number) => value / 1024 / 1024;

  const cpuValue = metrics?.cpuPercent ?? null;
  const hasCpuData = isMetricValue(cpuValue);
  const cpuLabel = hasCpuData ? `${cpuValue.toFixed(1)}%` : "-";

  const memoryUsageValue = metrics?.memoryUsage ?? null;
  const memoryLimitValue = metrics?.memoryLimit ?? null;
  const hasMemoryUsage = isMetricValue(memoryUsageValue);
  const hasMemoryLimit =
    hasMemoryUsage && isMetricValue(memoryLimitValue) && memoryLimitValue > 0;
  const memoryLabel = (() => {
    if (!hasMemoryUsage) {
      return "-";
    }

    const usage = formatBytes(memoryUsageValue);

    if (!hasMemoryLimit) {
      return usage;
    }

    return `${usage} / ${formatBytes(memoryLimitValue)}`;
  })();

  const networkRxValue = metrics?.networkRx ?? null;
  const networkTxValue = metrics?.networkTx ?? null;
  const hasNetworkRx = isMetricValue(networkRxValue);
  const hasNetworkTx = isMetricValue(networkTxValue);
  const inboundLabel = hasNetworkRx ? formatBytes(networkRxValue) : "-";
  const outboundLabel = hasNetworkTx ? formatBytes(networkTxValue) : "-";

  const diskReadValue = metrics?.diskRead ?? null;
  const diskWriteValue = metrics?.diskWrite ?? null;
  const hasDiskRead = isMetricValue(diskReadValue);
  const hasDiskWrite = isMetricValue(diskWriteValue);
  const diskReadLabel = hasDiskRead ? formatBytes(diskReadValue) : "-";
  const diskWriteLabel = hasDiskWrite ? formatBytes(diskWriteValue) : "-";

  const hasAnyMetricValues =
    hasCpuData ||
    hasMemoryUsage ||
    hasNetworkRx ||
    hasNetworkTx ||
    hasDiskRead ||
    hasDiskWrite;

  const cpuChartConfig = {
    usage: {
      label: "CPU usage",
      color: "hsl(var(--primary))",
    },
  };
  const cpuChartData = [
    {
      name: "usage",
      value: clampPercent(cpuValue ?? 0),
    },
  ];

  const memoryChartConfig = {
    used: {
      label: "Memory usage",
      color: "hsl(var(--accent))",
    },
  };
  const memoryUsagePercent = hasMemoryLimit
    ? clampPercent(((memoryUsageValue ?? 0) / (memoryLimitValue || 1)) * 100)
    : null;
  const memoryChartData = [
    {
      name: "used",
      value: memoryUsagePercent ?? 0,
    },
  ];

  const networkChartConfig = {
    inbound: {
      label: "Inbound",
      color: "hsl(var(--primary))",
    },
    outbound: {
      label: "Outbound",
      color: "hsl(var(--muted-foreground))",
    },
  };
  const networkChartData = [
    {
      label: "Network",
      inbound: hasNetworkRx ? bytesToMegabytes(networkRxValue) : 0,
      outbound: hasNetworkTx ? bytesToMegabytes(networkTxValue) : 0,
    },
  ];

  const diskChartConfig = {
    read: {
      label: "Read",
      color: "hsl(var(--accent))",
    },
    write: {
      label: "Write",
      color: "hsl(var(--destructive))",
    },
  };
  const diskChartData = [
    {
      label: "Disk",
      read: hasDiskRead ? bytesToMegabytes(diskReadValue) : 0,
      write: hasDiskWrite ? bytesToMegabytes(diskWriteValue) : 0,
    },
  ];

  return (
    <div className="space-y-4 p-4">
      {hasAnyMetricValues ? (
        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            icon={GaugeIcon}
            isAvailable={hasCpuData}
            title="CPU"
            unavailableMessage="CPU metrics unavailable"
            value={cpuLabel}
          >
            <div className="relative flex justify-center">
              <ChartContainer
                className="aspect-square w-full max-w-[180px]"
                config={cpuChartConfig}
              >
                <RadialBarChart
                  data={cpuChartData}
                  endAngle={-270}
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                >
                  <PolarAngleAxis
                    dataKey="value"
                    domain={[0, 100]}
                    tick={false}
                    type="number"
                  />
                  <RadialBar
                    background
                    cornerRadius={999}
                    dataKey="value"
                    fill="var(--color-usage)"
                  />
                </RadialBarChart>
              </ChartContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="font-semibold text-2xl">
                  {hasCpuData ? cpuValue.toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            icon={MemoryStickIcon}
            isAvailable={hasMemoryUsage}
            title="Memory"
            unavailableMessage="Memory metrics unavailable"
            value={memoryLabel}
            valueClassName="font-mono"
          >
            {hasMemoryLimit ? (
              <div className="relative flex justify-center">
                <ChartContainer
                  className="aspect-square w-full max-w-[180px]"
                  config={memoryChartConfig}
                >
                  <RadialBarChart
                    data={memoryChartData}
                    endAngle={-270}
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                  >
                    <PolarAngleAxis
                      dataKey="value"
                      domain={[0, 100]}
                      tick={false}
                      type="number"
                    />
                    <RadialBar
                      background
                      cornerRadius={999}
                      dataKey="value"
                      fill="var(--color-used)"
                    />
                  </RadialBarChart>
                </ChartContainer>

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="font-semibold text-2xl">
                    {memoryUsagePercent?.toFixed(0) ?? 0}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Memory limit not reported
              </p>
            )}
          </MetricCard>

          <MetricCard
            icon={ArrowDownUpIcon}
            isAvailable={hasNetworkRx || hasNetworkTx}
            title="Network I/O"
            unavailableMessage="Network metrics unavailable"
            value={
              hasNetworkRx || hasNetworkTx
                ? `${inboundLabel} ↓ / ${outboundLabel} ↑`
                : "-"
            }
            valueClassName="font-mono"
          >
            <ChartContainer className="h-40 w-full" config={networkChartConfig}>
              <BarChart barSize={28} data={networkChartData}>
                <CartesianGrid
                  className="stroke-border/60"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "currentColor" }}
                  tickLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(_, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span>
                            {name === "inbound" ? "Inbound" : "Outbound"}
                          </span>
                          <span className="font-mono text-foreground">
                            {name === "inbound" ? inboundLabel : outboundLabel}
                          </span>
                        </div>
                      )}
                      hideLabel
                    />
                  }
                  cursor={false}
                />
                <Bar
                  dataKey="inbound"
                  fill="var(--color-inbound)"
                  name="inbound"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="outbound"
                  fill="var(--color-outbound)"
                  name="outbound"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            <div className="grid gap-1 text-muted-foreground text-xs">
              <div className="flex items-center justify-between">
                <span>Inbound</span>
                <span className="font-mono text-foreground">
                  {inboundLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Outbound</span>
                <span className="font-mono text-foreground">
                  {outboundLabel}
                </span>
              </div>
            </div>
          </MetricCard>

          <MetricCard
            icon={HardDriveIcon}
            isAvailable={hasDiskRead || hasDiskWrite}
            title="Disk I/O"
            unavailableMessage="Disk metrics unavailable"
            value={
              hasDiskRead || hasDiskWrite
                ? `${diskReadLabel} ↓ / ${diskWriteLabel} ↑`
                : "-"
            }
            valueClassName="font-mono"
          >
            <ChartContainer className="h-40 w-full" config={diskChartConfig}>
              <BarChart barSize={28} data={diskChartData}>
                <CartesianGrid
                  className="stroke-border/60"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  tick={{ fill: "currentColor" }}
                  tickLine={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(_, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span>{name === "read" ? "Read" : "Write"}</span>
                          <span className="font-mono text-foreground">
                            {name === "read" ? diskReadLabel : diskWriteLabel}
                          </span>
                        </div>
                      )}
                      hideLabel
                    />
                  }
                  cursor={false}
                />
                <Bar
                  dataKey="read"
                  fill="var(--color-read)"
                  name="read"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="write"
                  fill="var(--color-write)"
                  name="write"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>

            <div className="grid gap-1 text-muted-foreground text-xs">
              <div className="flex items-center justify-between">
                <span>Read</span>
                <span className="font-mono text-foreground">
                  {diskReadLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Write</span>
                <span className="font-mono text-foreground">
                  {diskWriteLabel}
                </span>
              </div>
            </div>
          </MetricCard>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Runtime metrics are not available for this container.
        </p>
      )}
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  valueClassName?: string;
  isAvailable: boolean;
  unavailableMessage?: string;
  children: ReactNode;
};

function MetricCard({
  title,
  value,
  icon: Icon,
  valueClassName,
  isAvailable,
  unavailableMessage,
  children,
}: MetricCardProps) {
  return (
    <div className="space-y-4 rounded-lg bg-secondary/40 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p
            className={cn(
              "font-semibold text-base leading-tight",
              valueClassName
            )}
          >
            {value}
          </p>
        </div>
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {isAvailable ? (
        children
      ) : (
        <p className="text-muted-foreground text-sm">
          {unavailableMessage ?? `${title} metrics unavailable`}
        </p>
      )}
    </div>
  );
}
