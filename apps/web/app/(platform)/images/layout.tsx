import { Layers2Icon } from "lucide-react";
import PageHeader, {
  PageHeaderAction,
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
          <PageHeaderAction>Pull Image</PageHeaderAction>
        </PageHeaderActions>
      </PageHeader>

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        {children}
      </div>
    </div>
  );
}
