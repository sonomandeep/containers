import { BoxIcon } from "lucide-react";
import { NewContainerSheet } from "@/components/containers/new-container-sheet";
import PageHeader from "@/components/layout/page-header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full h-full flex flex-col gap-3">
      <PageHeader
        icon={BoxIcon}
        title="Containers"
        action={<NewContainerSheet />}
      />

      <div className="p-3 bg-background border rounded-md w-full h-full flex-1">
        {children}
      </div>
    </div>
  );
}
