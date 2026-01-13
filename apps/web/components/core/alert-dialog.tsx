import type { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import {
  AlertDialog as ShadcnAlertDialog,
  AlertDialogAction as ShadcnAlertDialogAction,
  AlertDialogCancel as ShadcnAlertDialogCancel,
  AlertDialogContent as ShadcnAlertDialogContent,
  AlertDialogFooter as ShadcnAlertDialogFooter,
  AlertDialogHeader as ShadcnAlertDialogHeader,
  AlertDialogTitle as ShadcnAlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const AlertDialog = ShadcnAlertDialog;

export function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm";
}) {
  return (
    <ShadcnAlertDialogContent
      className={cn("gap-0 rounded-lg bg-neutral-100 p-0", className)}
      size={size}
      {...props}
    />
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ShadcnAlertDialogHeader className={cn("gap-0", className)} {...props} />
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <ShadcnAlertDialogTitle className={cn("text-sm", className)} {...props} />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <ShadcnAlertDialogFooter className={cn("p-2", className)} {...props} />
  );
}

export const AlertDialogCancel = ShadcnAlertDialogCancel;
export const AlertDialogAction = ShadcnAlertDialogAction;
