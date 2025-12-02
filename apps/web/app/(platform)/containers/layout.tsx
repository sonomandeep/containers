import { BoxIcon } from "lucide-react";
import { LaunchContainer } from "@/components/containers/launch";
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
        <PageHeaderTitle icon={BoxIcon}>Containers</PageHeaderTitle>

        <PageHeaderActions>
          <LaunchContainer />
        </PageHeaderActions>
      </PageHeader>

      <div className="h-full w-full flex-1 rounded-md border bg-background p-3">
        {children}
      </div>
    </div>
  );
}
