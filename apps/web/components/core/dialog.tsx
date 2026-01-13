import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Dialog as ShadcnDialog,
  DialogClose as ShadcnDialogClose,
  DialogContent as ShadcnDialogContent,
  DialogFooter as ShadcnDialogFooter,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Dialog = ShadcnDialog;
export const DialogTrigger = ShadcnDialogTrigger;

export function DialogContent({
  className,
  ...props
}: DialogPrimitive.Popup.Props & { showCloseButton?: boolean }) {
  return (
    <ShadcnDialogContent
      className={cn("gap-0 rounded-lg bg-neutral-100 p-0", className)}
      {...props}
    />
  );
}

export function DialogCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-2 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3",
        className
      )}
      {...props}
    />
  );
}

export function DialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <ShadcnDialogHeader className={cn("p-2", className)} {...props} />;
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <ShadcnDialogTitle
      className={cn(
        "text-sm [&>span]:pl-2 [&>span]:text-muted-foreground [&>span]:text-xs",
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <ShadcnDialogFooter className={cn("p-2", className)} {...props} />;
}

export const DialogClose = ShadcnDialogClose;
