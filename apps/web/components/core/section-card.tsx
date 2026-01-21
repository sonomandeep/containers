import { cn } from "@/lib/utils";

export function SectionCard({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-3 rounded-lg border border-card-border bg-background p-3",
        className
      )}
      {...props}
    />
  );
}

export function SectionCardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between px-1.5",
        className
      )}
      {...props}
    />
  );
}

export function SectionCardHeaderContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-baseline gap-2", className)} {...props} />
  );
}

export function SectionCardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(className)} {...props} />;
}

export function SectionCardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

export function SectionCardActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      {...props}
    />
  );
}

export function SectionCardMeta({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}
