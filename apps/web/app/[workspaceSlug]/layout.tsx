import { redirect } from "next/navigation";
import { ImagesStoreSync } from "@/components/images/images-store-sync";
import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NO_ACTIVE_WORKSPACE_ERROR } from "@/lib/constants/organizations";
import { listImages } from "@/lib/services/images.service";
import { getActiveOrganizationSummary } from "@/lib/services/organizations.service";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}>) {
  const { workspaceSlug } = await params;
  const { data: organization, error: organizationError } =
    await getActiveOrganizationSummary();

  if (!organization) {
    if (organizationError === NO_ACTIVE_WORKSPACE_ERROR) {
      redirect("/onboarding");
    }

    throw new Error(organizationError || "Unable to load active workspace.");
  }

  const images = await listImages();

  if (images.error !== null) {
    throw new Error(images.error);
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar workspaceSlug={workspaceSlug} />

      <SidebarInset className="min-h-0 overflow-hidden rounded-none! bg-transparent! shadow-none!">
        <main className="h-full min-h-0 w-full overflow-hidden">
          <ImagesStoreSync images={images.data} />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
