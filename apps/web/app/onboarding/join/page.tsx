import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
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
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full gap-2">
            <Logo size={30} />
            <div className="flex flex-col">
              <AuthCardTitle>Join your team</AuthCardTitle>
              <AuthCardDescription>
                Join a workspace with an invite.
              </AuthCardDescription>
            </div>
          </div>
        </AuthCardHeader>

        <JoinInvitationIdForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Need a workspace?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/onboarding/create"
        >
          Create one
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
