import type { Metadata } from "next";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Containers - Mando",
  description: "Web docker containers platform.",
  icons: {
    icon: [
      {
        url: "icon.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "icon2.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-full">
        <SidebarProvider>
          <AppSidebar />

          <SidebarInset>
            <main className="h-full w-full">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
