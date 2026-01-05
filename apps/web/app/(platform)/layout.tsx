import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="rounded-none! bg-transparent! shadow-none!">
        <main className="h-full w-full">{children}</main>
        {/* <Toaster /> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
