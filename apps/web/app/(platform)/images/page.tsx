import {
  AlertTriangleIcon,
  ArchiveIcon,
  HardDriveIcon,
  LayersIcon,
  MemoryStickIcon,
} from "lucide-react";
import {
  SectionCard,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardMeta,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
import {
  MetricCard,
  MetricCardContent,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardProgress,
  MetricCardStats,
  MetricCardValue,
} from "@/components/core/metric-card";

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
          <MetricCard>
            <MetricCardHeader>
              <LayersIcon />
              In Use
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>16</MetricCardValue>
                <MetricCardLabel>224 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar value={59.25} />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <ArchiveIcon />
              Unused
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>7</MetricCardValue>
                <MetricCardLabel>98 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar
                  activeClassName="bg-amber-500"
                  value={25.92}
                />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>

          <MetricCard>
            <MetricCardHeader>
              <AlertTriangleIcon />
              Dangling
            </MetricCardHeader>
            <MetricCardContent>
              <MetricCardStats>
                <MetricCardValue>4</MetricCardValue>
                <MetricCardLabel>56 GB</MetricCardLabel>
              </MetricCardStats>
              <MetricCardProgress>
                <SegmentedProgressBar
                  activeClassName="bg-red-500"
                  value={14.81}
                />
              </MetricCardProgress>
            </MetricCardContent>
          </MetricCard>
        </div>
      </SectionCard>
    </div>
  );
}
