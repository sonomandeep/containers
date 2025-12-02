import type { LucideIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.ComponentProps<"header"> {
  children: ReactNode;
}

export default function PageHeader({
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full flex-wrap items-center justify-between gap-3 px-1",
        className
      )}
      {...props}
    >
      {children}
    </header>
  );
}

interface PageHeaderTitleProps {
  icon?: LucideIcon;
  children: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function PageHeaderTitle({
  icon: Icon,
  children,
  description,
  className,
}: PageHeaderTitleProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {Icon ? <Icon className="size-4 opacity-80" /> : null}

      <div className="flex flex-col leading-tight">
        <h1 className="font-medium text-base">{children}</h1>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

interface PageHeaderActionsProps extends React.ComponentProps<"div"> {
  children: ReactNode;
}

export function PageHeaderActions({
  children,
  className,
  ...props
}: PageHeaderActionsProps) {
  return (
    <div
      className={cn("inline-flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface PageHeaderActionProps extends ButtonProps {
  icon?: LucideIcon | null;
}

export function PageHeaderAction({
  icon: Icon = PlusIcon,
  children,
  className,
  ...props
}: PageHeaderActionProps) {
  return (
    <Button
      className={cn("gap-1.5", className)}
      size="sm"
      variant="outline"
      {...props}
    >
      {Icon ? <Icon className="size-3.5 opacity-80" /> : null}
      {children}
    </Button>
  );
}
