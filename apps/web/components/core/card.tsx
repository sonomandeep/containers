import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <ShadcnCard
      className={cn(
        "gap-0 border border-card-border p-0 px-1.5 ring-0",
        className
      )}
      {...props}
    />
  );
}

export function CardToolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-between px-3 py-2 text-muted-foreground text-xs",
        className
      )}
      data-slot="card-toolbar"
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ShadcnCardHeader
      className={cn("gap-0 rounded-none px-0", className)}
      {...props}
    />
  );
}

export const CardTitle = ShadcnCardTitle;
export const CardDescription = ShadcnCardDescription;

export function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ShadcnCardContent
      className={cn(
        "flex flex-col gap-4 rounded-lg border border-card-border bg-white px-3 py-3 dark:bg-black",
        className
      )}
      {...props}
    />
  );
}

export function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ShadcnCardFooter
      className={cn(
        "rounded-none px-3 py-2 text-muted-foreground text-xs",
        className
      )}
      {...props}
    />
  );
}
