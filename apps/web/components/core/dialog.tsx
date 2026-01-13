import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  DialogContent as ShadcnDialogContent,
  Dialog as ShadcnDialog,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogFooter as ShadcnDialogFooter,
  DialogClose as ShadcnDialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Dialog = ShadcnDialog;

export function DialogContent({
  className,
  size = "default",
  ...props
}: DialogPrimitive.Popup.Props & {
  size?: "default" | "sm";
}) {
  return (
    <ShadcnDialogContent
      className={cn("gap-0 rounded-lg bg-neutral-100 p-0", className)}
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
