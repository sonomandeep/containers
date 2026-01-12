import { HardDriveIcon, LayersIcon, MemoryStickIcon } from "lucide-react";
import {
  SectionCard,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardMeta,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";

export default function Page() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <SectionCard>
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Cluster Images</SectionCardTitle>
            <SectionCardDescription>37 images</SectionCardDescription>
          </SectionCardHeaderContent>
          <SectionCardMeta>376 GB</SectionCardMeta>
        </SectionCardHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <LayersIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                CPU
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">32.5%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  12 vCPU
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={32.5} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <MemoryStickIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                Memory
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">93.8%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  32 GB
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={93.8} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            <div className="inline-flex items-center gap-1">
              <HardDriveIcon className="size-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground text-xs">
                Disk
              </span>
            </div>

            <div className="flex w-full flex-col gap-1">
              <div className="inline-flex w-full items-center justify-between font-mono">
                <span className="font-medium text-neutral-700">74.2%</span>
                <span className="font-medium text-muted-foreground text-xs">
                  512 GB
                </span>
              </div>

              <div className="h-3 w-full">
                <SegmentedProgressBar value={74.2} />
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
