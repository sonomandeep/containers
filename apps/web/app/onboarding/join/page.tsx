import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/core/logo";
import { JoinInvitationIdForm } from "@/components/organizations/join/form";

type Props = {
  searchParams: Promise<{
    invitationId?: string;
    inviterEmail?: string;
    organizationName?: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const { invitationId, inviterEmail, organizationName } = await searchParams;
  const normalizedInvitationId = invitationId?.trim();
  const normalizedInviterEmail = inviterEmail?.trim();
  const normalizedOrganizationName = organizationName?.trim();

  if (normalizedInvitationId) {
    const nextSearchParams = new URLSearchParams();

    if (normalizedInviterEmail) {
      nextSearchParams.set("inviterEmail", normalizedInviterEmail);
    }

    if (normalizedOrganizationName) {
      nextSearchParams.set("organizationName", normalizedOrganizationName);
    }

    const query = nextSearchParams.toString();
    redirect(
      `/onboarding/join/${encodeURIComponent(normalizedInvitationId)}${query ? `?${query}` : ""}`
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-6">
      <header className="inline-flex w-full gap-2">
        <Logo size={30} />
        <div className="flex flex-col">
          <h1>Join your team</h1>
          <p className="text-muted-foreground text-xs">
            Join a workspace with an invite.
          </p>
        </div>
      </header>

      <JoinInvitationIdForm />

      <div className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs">
        <span>Need a workspace?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/onboarding/create"
        >
          Create one
        </Link>
      </div>
    </section>
  );
}
