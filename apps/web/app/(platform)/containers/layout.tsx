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
    <div className="w-full h-full flex flex-col gap-3">
      <PageHeader>
        <PageHeaderTitle icon={BoxIcon}>Containers</PageHeaderTitle>

        <PageHeaderActions>
          <LaunchContainer />
        </PageHeaderActions>
      </PageHeader>

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        {children}
      </div>
    </div>
  );
}
