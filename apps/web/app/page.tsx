import { redirect } from "next/navigation";
import { NO_ACTIVE_WORKSPACE_ERROR } from "@/lib/constants/organizations";
import { getActiveOrganizationSummary } from "@/lib/services/organizations.service";

export default async function Page() {
  const { data: organization, error: organizationError } =
    await getActiveOrganizationSummary();

  if (!organization) {
    if (organizationError === NO_ACTIVE_WORKSPACE_ERROR) {
      redirect("/onboarding");
    }

    throw new Error(organizationError || "Unable to load active workspace.");
  }

  redirect(`/${organization.slug}/containers`);
}
