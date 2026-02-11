import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InviteMembersForm } from "@/components/organizations/invite/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getActiveOrganizationSummary } from "@/lib/services/organizations.service";

export default async function Page() {
  const { data: organization } = await getActiveOrganizationSummary();

  if (!organization) {
    redirect("/onboarding/create");
  }

  const workspaceInitial = organization.name.trim().charAt(0) || "A";

  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-6">
      <header className="inline-flex w-full items-center gap-3">
        <Avatar className="size-9 after:rounded-md has-[img]:after:border-0">
          <AvatarImage
            alt={`${organization.name} logo`}
            className="rounded-md"
            src={organization.logo || undefined}
          />
          <AvatarFallback className="rounded-md font-medium font-mono uppercase">
            {workspaceInitial}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col">
          <h1>{organization.name}</h1>
          <p className="font-mono text-muted-foreground text-xs">
            paper.mando.sh/{organization.slug}
          </p>
        </div>
      </header>

      <InviteMembersForm />

      <Link
        className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs underline transition-colors hover:text-foreground"
        href="/containers"
      >
        Do it later
        <ArrowRightIcon className="size-3" />
      </Link>
    </section>
  );
}
