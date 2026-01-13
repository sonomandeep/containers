import { AlertTriangleIcon, ArchiveIcon, LayersIcon } from "lucide-react";
import {
  MetricCard,
  MetricCardContent,
  MetricCardHeader,
  MetricCardLabel,
  MetricCardProgress,
  MetricCardStats,
  MetricCardValue,
} from "@/components/core/metric-card";
import {
  SectionCard,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardHeaderContent,
  SectionCardMeta,
  SectionCardTitle,
} from "@/components/core/section-card";
import { SegmentedProgressBar } from "@/components/core/segmented-progress-bar";
import { ImagesSection } from "@/components/images/images-section";
import { listImages } from "@/lib/services/images.service";
import { ImagesStoreSync } from "@/components/images/images-store-sync";
import prettyBytes from "pretty-bytes";

export default async function Page() {
  const { data, error } = await listImages();

  if (error !== null) {
    throw new Error(error);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <ImagesStoreSync images={data} />

      <SectionCard>
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Cluster Images</SectionCardTitle>
            <SectionCardDescription>
              {data.length} Images
            </SectionCardDescription>
          </SectionCardHeaderContent>

          <SectionCardMeta>
            {prettyBytes(data.reduce((acc, image) => acc + image.size, 0))}
          </SectionCardMeta>
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

      <SectionCard className="@container min-h-0 flex-1 overflow-hidden">
        <SectionCardHeader>
          <SectionCardHeaderContent>
            <SectionCardTitle>Your Images</SectionCardTitle>
          </SectionCardHeaderContent>
        </SectionCardHeader>

        <ImagesSection />
      </SectionCard>
    </div>
  );
}
