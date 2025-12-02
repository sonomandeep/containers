import { Layers2Icon } from "lucide-react";
import { PullImageDialog } from "@/components/images/pull/pull-image-dialog";
import PageHeader, {
  PageHeaderActions,
  PageHeaderTitle,
} from "@/components/layout/page-header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full w-full flex-col gap-3">
      <PageHeader>
        <PageHeaderTitle icon={Layers2Icon}>Images</PageHeaderTitle>

        <PageHeaderActions>
          <PullImageDialog />
        </PageHeaderActions>
      </PageHeader>

      <div className="h-full w-full flex-1 rounded-md border bg-background p-3">
        {children}
      </div>
    </div>
  );
}
