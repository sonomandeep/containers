import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
}

export default function PageHeader({ icon: Icon, title }: Props) {
  return (
    <header className="inline-flex gap-2 items-center py-2 pb-3 px-3">
      <Icon className="size-4 opacity-60" />
      <h1>{title}</h1>
    </header>
  );
}
