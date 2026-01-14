import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/core/card";
import { DialogFooter } from "@/components/core/dialog";
import { cn } from "@/lib/utils";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
};

export function AuthCard({ children, className }: AuthCardProps) {
  return <Card className={cn("pt-1.5", className)}>{children}</Card>;
}

export function AuthCardContent({ children, className }: AuthCardProps) {
  return (
    <CardContent className={cn("max-w-2xs", className)}>{children}</CardContent>
  );
}

export function AuthCardHeader({ children, className }: AuthCardProps) {
  return (
    <CardHeader className={cn("flex w-3xs flex-col gap-2", className)}>
      {children}
    </CardHeader>
  );
}

export function AuthCardTitle({ children, className }: AuthCardProps) {
  return (
    <CardTitle className={className}>
      <h1>{children}</h1>
    </CardTitle>
  );
}

export function AuthCardDescription({ children, className }: AuthCardProps) {
  return (
    <CardDescription className={cn("text-muted-foreground text-xs", className)}>
      {children}
    </CardDescription>
  );
}

export function AuthCardFooter({ children, className }: AuthCardProps) {
  return (
    <DialogFooter
      className={cn("justify-center! text-muted-foreground", className)}
    >
      {children}
    </DialogFooter>
  );
}
