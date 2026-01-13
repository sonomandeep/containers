import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />

      <SidebarInset className="min-h-0 overflow-hidden rounded-none! bg-transparent! shadow-none!">
        <main className="h-full min-h-0 w-full overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
