import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { checkAuthentication } from "@/lib/services/auth.service";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await checkAuthentication();

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
