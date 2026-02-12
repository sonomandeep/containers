import { redirect } from "next/navigation";
import { getActiveOrganizationSummary } from "@/lib/services/organizations.service";

export default async function Page() {
  const { data: organization } = await getActiveOrganizationSummary();

  if (!organization) {
    redirect("/onboarding");
  }

  redirect(`/${organization.slug}/containers`);
}
