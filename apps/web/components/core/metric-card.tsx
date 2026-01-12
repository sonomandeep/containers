import { cn } from "@/lib/utils";

export function MetricCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3",
        className
      )}
      {...props}
    />
  );
}

export function MetricCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-medium text-muted-foreground text-xs [&>svg]:size-3",
        className
      )}
      {...props}
    />
  );
}

export function MetricCardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex w-full flex-col gap-1", className)} {...props} />
  );
}

export function MetricCardStats({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex w-full items-center justify-between font-mono",
        className
      )}
      {...props}
    />
  );
}

export function MetricCardValue({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-medium text-neutral-700", className)}
      {...props}
    />
  );
}

export function MetricCardLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-medium text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

export function MetricCardProgress({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("h-3 w-full", className)} {...props} />;
}
