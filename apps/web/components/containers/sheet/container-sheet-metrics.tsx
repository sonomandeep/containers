"use client";

import type { Container } from "@containers/shared";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowDownUpIcon,
  GaugeIcon,
  HardDriveIcon,
  MemoryStickIcon,
} from "lucide-react";
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

interface Props {
  metrics?: Container["metrics"];
}

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
  const hasMemoryLimit
    = hasMemoryUsage && isMetricValue(memoryLimitValue) && memoryLimitValue > 0;
  const memoryLabel = (() => {
    if (!hasMemoryUsage)
      return "-";

    const usage = formatBytes(memoryUsageValue!);

    if (!hasMemoryLimit) {
      return usage;
    }

    return `${usage} / ${formatBytes(memoryLimitValue!)}`;
  })();

  const networkRxValue = metrics?.networkRx ?? null;
  const networkTxValue = metrics?.networkTx ?? null;
  const hasNetworkRx = isMetricValue(networkRxValue);
  const hasNetworkTx = isMetricValue(networkTxValue);
  const inboundLabel = hasNetworkRx ? formatBytes(networkRxValue!) : "-";
  const outboundLabel = hasNetworkTx ? formatBytes(networkTxValue!) : "-";

  const diskReadValue = metrics?.diskRead ?? null;
  const diskWriteValue = metrics?.diskWrite ?? null;
  const hasDiskRead = isMetricValue(diskReadValue);
  const hasDiskWrite = isMetricValue(diskWriteValue);
  const diskReadLabel = hasDiskRead ? formatBytes(diskReadValue!) : "-";
  const diskWriteLabel = hasDiskWrite ? formatBytes(diskWriteValue!) : "-";

  const hasAnyMetricValues
    = hasCpuData
      || hasMemoryUsage
      || hasNetworkRx
      || hasNetworkTx
      || hasDiskRead
      || hasDiskWrite;

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
      inbound: hasNetworkRx ? bytesToMegabytes(networkRxValue!) : 0,
      outbound: hasNetworkTx ? bytesToMegabytes(networkTxValue!) : 0,
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
      read: hasDiskRead ? bytesToMegabytes(diskReadValue!) : 0,
      write: hasDiskWrite ? bytesToMegabytes(diskWriteValue!) : 0,
    },
  ];

  return (
    <div className="p-4 border-b border-secondary space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Runtime metrics
        </p>
      </div>

      {hasAnyMetricValues
        ? (
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="CPU"
                value={cpuLabel}
                icon={GaugeIcon}
                isAvailable={hasCpuData}
                unavailableMessage="CPU metrics unavailable"
              >
                <div className="relative flex justify-center">
                  <ChartContainer
                    config={cpuChartConfig}
                    className="aspect-square w-full max-w-[180px]"
                  >
                    <RadialBarChart
                      data={cpuChartData}
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        dataKey="value"
                        tick={false}
                      />
                      <RadialBar
                        dataKey="value"
                        cornerRadius={999}
                        fill="var(--color-usage)"
                        background
                      />
                    </RadialBarChart>
                  </ChartContainer>

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold">
                      {hasCpuData ? cpuValue!.toFixed(0) : 0}
                      %
                    </span>
                  </div>
                </div>
              </MetricCard>

              <MetricCard
                title="Memory"
                value={memoryLabel}
                icon={MemoryStickIcon}
                valueClassName="font-mono"
                isAvailable={hasMemoryUsage}
                unavailableMessage="Memory metrics unavailable"
              >
                {hasMemoryLimit
                  ? (
                      <div className="relative flex justify-center">
                        <ChartContainer
                          config={memoryChartConfig}
                          className="aspect-square w-full max-w-[180px]"
                        >
                          <RadialBarChart
                            data={memoryChartData}
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                          >
                            <PolarAngleAxis
                              type="number"
                              domain={[0, 100]}
                              dataKey="value"
                              tick={false}
                            />
                            <RadialBar
                              dataKey="value"
                              cornerRadius={999}
                              fill="var(--color-used)"
                              background
                            />
                          </RadialBarChart>
                        </ChartContainer>

                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-semibold">
                            {memoryUsagePercent?.toFixed(0) ?? 0}
                            %
                          </span>
                        </div>
                      </div>
                    )
                  : (
                      <p className="text-sm text-muted-foreground">
                        Memory limit not reported
                      </p>
                    )}
              </MetricCard>

              <MetricCard
                title="Network I/O"
                value={
                  hasNetworkRx || hasNetworkTx
                    ? `${inboundLabel} ↓ / ${outboundLabel} ↑`
                    : "-"
                }
                icon={ArrowDownUpIcon}
                valueClassName="font-mono"
                isAvailable={hasNetworkRx || hasNetworkTx}
                unavailableMessage="Network metrics unavailable"
              >
                <>
                  <ChartContainer
                    config={networkChartConfig}
                    className="h-40 w-full"
                  >
                    <BarChart data={networkChartData} barSize={28}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-border/60"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "currentColor" }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={(
                          <ChartTooltipContent
                            hideLabel
                            formatter={(_, name) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span>
                                  {name === "inbound" ? "Inbound" : "Outbound"}
                                </span>
                                <span className="font-mono text-foreground">
                                  {name === "inbound"
                                    ? inboundLabel
                                    : outboundLabel}
                                </span>
                              </div>
                            )}
                          />
                        )}
                      />
                      <Bar
                        dataKey="inbound"
                        name="inbound"
                        fill="var(--color-inbound)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="outbound"
                        name="outbound"
                        fill="var(--color-outbound)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>

                  <div className="grid gap-1 text-xs text-muted-foreground">
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
                </>
              </MetricCard>

              <MetricCard
                title="Disk I/O"
                value={
                  hasDiskRead || hasDiskWrite
                    ? `${diskReadLabel} ↓ / ${diskWriteLabel} ↑`
                    : "-"
                }
                icon={HardDriveIcon}
                valueClassName="font-mono"
                isAvailable={hasDiskRead || hasDiskWrite}
                unavailableMessage="Disk metrics unavailable"
              >
                <>
                  <ChartContainer config={diskChartConfig} className="h-40 w-full">
                    <BarChart data={diskChartData} barSize={28}>
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="4 4"
                        className="stroke-border/60"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "currentColor" }}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={(
                          <ChartTooltipContent
                            hideLabel
                            formatter={(_, name) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span>{name === "read" ? "Read" : "Write"}</span>
                                <span className="font-mono text-foreground">
                                  {name === "read" ? diskReadLabel : diskWriteLabel}
                                </span>
                              </div>
                            )}
                          />
                        )}
                      />
                      <Bar
                        dataKey="read"
                        name="read"
                        fill="var(--color-read)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="write"
                        name="write"
                        fill="var(--color-write)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>

                  <div className="grid gap-1 text-xs text-muted-foreground">
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
                </>
              </MetricCard>
            </div>
          )
        : (
            <p className="text-sm text-muted-foreground">
              Runtime metrics are not available for this container.
            </p>
          )}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  valueClassName?: string;
  isAvailable: boolean;
  unavailableMessage?: string;
  children: ReactNode;
}

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
    <div className="rounded-lg border border-secondary bg-secondary/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p
            className={cn(
              "text-base font-semibold leading-tight",
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
        <Icon className="size-4 text-muted-foreground" />
      </div>

      {isAvailable
        ? (
            children
          )
        : (
            <p className="text-sm text-muted-foreground">
              {unavailableMessage ?? `${title} metrics unavailable`}
            </p>
          )}
    </div>
  );
}
