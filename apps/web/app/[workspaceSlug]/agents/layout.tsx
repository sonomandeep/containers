import { BoxIcon } from "lucide-react";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <div className="inline-flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <BoxIcon className="size-3.5 opacity-80" />
          <h1>Agents</h1>
        </div>
        action
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
