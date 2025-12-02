"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function InfoCard({
  children,
  className,
  contentClassName,
}: InfoCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border border-secondary bg-neutral-50 p-3 shadow-none dark:bg-neutral-900/50",
        className
      )}
    >
      <CardContent className={cn("flex flex-col gap-4 px-0", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

interface InfoCardRowProps {
  icon?: LucideIcon;
  label: ReactNode;
  children: ReactNode;
}

export function InfoCardRow({ icon, label, children }: InfoCardRowProps) {
  const Icon = icon;
  return (
    <div className="grid grid-cols-[128px_1fr] gap-3">
      <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
        {Icon ? <Icon className="size-3.5 opacity-60" /> : null}
        <span>{label}</span>
      </div>

      <div className="text-foreground text-sm [&>*]:text-sm">{children}</div>
    </div>
  );
}
