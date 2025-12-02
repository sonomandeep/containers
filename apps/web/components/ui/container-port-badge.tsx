"use client";

import type { ContainerPort } from "@containers/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ContainerPortBadgeProps {
  port: ContainerPort;
  className?: string;
  showIpLabel?: boolean;
}

function getIpLabel(ip: string) {
  if (ip === "0.0.0.0") {
    return "IPv4";
  }

  if (ip === "::") {
    return "IPv6";
  }

  return ip;
}

export function ContainerPortBadge({
  port,
  className,
  showIpLabel = true,
}: ContainerPortBadgeProps) {
  const ipLabel = getIpLabel(port.ip);

  return (
    <Badge
      className={cn("inline-flex items-center gap-2 font-mono", className)}
      variant="outline"
    >
      {showIpLabel ? (
        <span className="text-[11px] text-foreground/70 uppercase tracking-wide">
          {ipLabel}
        </span>
      ) : null}
      {`${port.publicPort}:${port.privatePort}`}
    </Badge>
  );
}
