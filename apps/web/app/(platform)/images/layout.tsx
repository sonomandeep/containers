import { CornerDownLeftIcon, LayersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3">
      <div className="inline-flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <LayersIcon className="size-3.5 opacity-80" />
          <h1>Images</h1>
        </div>

        <Button>
          Pull Image
          <CornerDownLeftIcon className="size-3 opacity-60" />
        </Button>
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
