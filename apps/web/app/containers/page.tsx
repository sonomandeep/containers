import { BoxIcon } from "lucide-react";
import PageHeader from "@/components/layout/page-header";

export default function Page() {
  return (
    <div className="w-full h-full flex flex-col">
      <PageHeader icon={BoxIcon} title="Containers" />

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        Hello World
      </div>
    </div>
  );
}
