"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ButtonProps } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  SheetHeader as SheetHeaderPrimitive,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DivProps = React.ComponentProps<"div">;

export function SheetHeaderToolbar({
  children,
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn(
        "flex h-[53px] items-center justify-between border-b border-secondary px-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SheetHeaderBackButtonProps extends ButtonProps {
  icon?: LucideIcon | null;
}

export function SheetHeaderBackButton({
  icon: Icon = ChevronLeftIcon,
  className,
  ...props
}: SheetHeaderBackButtonProps) {
  return (
    <SheetClose asChild>
      <Button
        size="icon-xs"
        variant="ghost"
        className={cn("shrink-0", className)}
        {...props}
      >
        {Icon ? <Icon className="size-3.5 opacity-60" /> : null}
      </Button>
    </SheetClose>
  );
}

interface SheetHeaderBadgeProps extends DivProps {
  icon?: LucideIcon | null;
  children: ReactNode;
}

export function SheetHeaderBadge({
  icon: Icon,
  children,
  className,
  ...props
}: SheetHeaderBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md bg-neutral-100 px-2",
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="size-3.5 opacity-60" /> : null}
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  );
}

export function SheetHeaderContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof SheetHeaderPrimitive>) {
  return (
    <SheetHeaderPrimitive
      className={cn(
        "flex-row items-center gap-4 border-b border-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </SheetHeaderPrimitive>
  );
}

export function SheetHeaderIcon({
  children,
  className,
  ...props
}: DivProps) {
  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-md bg-secondary",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
