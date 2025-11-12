"use client";

import type { Container } from "@containers/shared";
import {
  ArrowDownUpIcon,
  GaugeIcon,
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
import { formatBytes } from "@/lib/utils";

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
  const networkLabel = (() => {
    const parts: string[] = [];

    if (hasNetworkRx) {
      parts.push(`${formatBytes(networkRxValue!)} in`);
    }

    if (hasNetworkTx) {
      parts.push(`${formatBytes(networkTxValue!)} out`);
    }

    return parts.length ? parts.join(" / ") : "-";
  })();

  const hasAnyMetricValues
    = hasCpuData || hasMemoryUsage || hasNetworkRx || hasNetworkTx;

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
      color: "hsl(var(--destructive))",
    },
  };
  const networkChartData
    = hasNetworkRx || hasNetworkTx
      ? [
          {
            label: "I/O",
            inbound: hasNetworkRx ? bytesToMegabytes(networkRxValue!) : 0,
            outbound: hasNetworkTx ? bytesToMegabytes(networkTxValue!) : 0,
          },
        ]
      : [];
  const inboundLabel = hasNetworkRx ? formatBytes(networkRxValue!) : "-";
  const outboundLabel = hasNetworkTx ? formatBytes(networkTxValue!) : "-";

  return (
    <div className="p-4 border-b border-secondary space-y-4">
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          Runtime metrics
        </p>
      </div>

      {hasAnyMetricValues
        ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-secondary bg-secondary/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">CPU</p>
                    <p className="text-lg font-semibold">{cpuLabel}</p>
                  </div>
                  <GaugeIcon className="size-4 text-muted-foreground" />
                </div>

                {hasCpuData
                  ? (
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
                    )
                  : (
                      <p className="text-sm text-muted-foreground">
                        CPU metrics unavailable
                      </p>
                    )}
              </div>

              <div className="rounded-lg border border-secondary bg-secondary/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="text-lg font-semibold font-mono">{memoryLabel}</p>
                  </div>
                  <MemoryStickIcon className="size-4 text-muted-foreground" />
                </div>

                {hasMemoryUsage
                  ? (
                      hasMemoryLimit
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
                          )
                    )
                  : (
                      <p className="text-sm text-muted-foreground">
                        Memory metrics unavailable
                      </p>
                    )}
              </div>

              <div className="rounded-lg border border-secondary bg-secondary/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Network I/O</p>
                    <p className="text-lg font-semibold font-mono">
                      {networkLabel}
                    </p>
                  </div>
                  <ArrowDownUpIcon className="size-4 text-muted-foreground" />
                </div>

                {hasNetworkRx || hasNetworkTx
                  ? (
                      <>
                        <ChartContainer
                          config={networkChartConfig}
                          className="h-48 w-full"
                        >
                          <BarChart data={networkChartData} barSize={24}>
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
                    )
                  : (
                      <p className="text-sm text-muted-foreground">
                        Network metrics unavailable
                      </p>
                    )}
              </div>
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
