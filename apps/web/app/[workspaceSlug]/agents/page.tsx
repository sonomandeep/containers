import { SectionCard } from "@/components/core/section-card";

export default function Page() {
  return (
    <div className="grid h-full min-h-0 grid-cols-5 gap-3 overflow-hidden">
      <SectionCard className="@container col-span-3 min-h-0 overflow-hidden" />

      <SectionCard className="@container col-span-2 min-h-0 overflow-hidden" />
    </div>
  );
}
