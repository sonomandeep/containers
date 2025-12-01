import { BoxIcon, CornerDownLeftIcon } from "lucide-react";
import PageHeader, {
  PageHeaderActions,
  PageHeaderTitle,
} from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

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
          <Button size="sm">
            New Container
            <KbdGroup>
              <Kbd>
                <CornerDownLeftIcon />
              </Kbd>
            </KbdGroup>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        {children}
      </div>
    </div>
  );
}
