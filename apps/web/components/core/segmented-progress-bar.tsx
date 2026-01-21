"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SegmentedProgressBarProps = {
  value: number;
  max?: number;
  segments?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  activeClassName?: string;
  ariaLabel?: string;
};

const sizeStyles = {
  sm: { container: "gap-[2px]", segment: "h-2.5 w-[2px]" },
  md: { container: "gap-[2px]", segment: "h-3.5 w-[2px]" },
  lg: { container: "gap-[2px]", segment: "h-4 w-[2px]" },
} as const;

const SEGMENT_WIDTH = 2;
const SEGMENT_GAP = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SegmentedProgressBar({
  value,
  max = 100,
  segments = 48,
  size = "md",
  className,
  activeClassName,
  ariaLabel,
}: SegmentedProgressBarProps) {
  const safeMax = Math.max(1, max);
  const clampedValue = clamp(value, 0, safeMax);
  const fallbackSegments = Math.max(1, segments);
  const [responsiveSegments, setResponsiveSegments] =
    useState<number>(fallbackSegments);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const width = entry.contentRect.width;
      if (width <= 0) {
        return;
      }

      const nextSegments = Math.max(
        1,
        Math.floor((width + SEGMENT_GAP) / (SEGMENT_WIDTH + SEGMENT_GAP))
      );
      setResponsiveSegments((current) =>
        current === nextSegments ? current : nextSegments
      );
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const segmentCount = Math.max(1, responsiveSegments || fallbackSegments);
  const filledSegments =
    clampedValue === safeMax
      ? segmentCount
      : Math.floor((clampedValue / safeMax) * segmentCount);
  const activeColorClass = getActiveColorClass(value);

  const segmentIndexes = Array.from(
    { length: segmentCount },
    (_, index) => index
  );
  const { container, segment } = sizeStyles[size];

  const items: Array<React.ReactNode> = [];
  for (const index of segmentIndexes) {
    const isActive = index < filledSegments;
    items.push(
      <span
        aria-hidden
        className={cn(
          "rounded-full transition-colors",
          segment,
          isActive ? cn(activeColorClass, activeClassName) : cn("bg-muted!")
        )}
        key={`segment-${index}`}
      />
    );
  }

  return (
    <div
      aria-label={ariaLabel ?? "Progress"}
      aria-valuemax={safeMax}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={cn("flex w-full items-center", container, className)}
      ref={containerRef}
      role="progressbar"
    >
      {items}
    </div>
  );
}

function getActiveColorClass(value: number) {
  if (value < 70) {
    return "bg-blue-500";
  }

  if (value < 90) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}
