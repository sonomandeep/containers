import type { LucideIcon } from "lucide-react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  actionLabel?: string;
}

export default function PageHeader({
  icon: Icon,
  title,
  actionLabel = "New Container",
}: Props) {
  return (
    <header className="inline-flex gap-2 items-center justify-between px-1">
      <div className="inline-flex items-center gap-2">
        <Icon className="size-4 opacity-80" />
        <h1>{title}</h1>
      </div>

      <Button size="sm" variant="outline">
        <PlusIcon className="size-3.5 opacity-80" />
        {actionLabel}
      </Button>
    </header>
  );
}
