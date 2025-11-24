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
    <div className="w-full h-full flex flex-col gap-3">
      <PageHeader>
        <PageHeaderTitle icon={Layers2Icon}>Images</PageHeaderTitle>

        <PageHeaderActions>
          <PullImageDialog />
        </PageHeaderActions>
      </PageHeader>

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        {children}
      </div>
    </div>
  );
}
