import Link from "next/link";
import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { Logo } from "@/components/core/logo";
import { JoinTeamForm } from "@/components/organizations/join/form";

type Props = {
  searchParams: Promise<{ invitationId?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { invitationId } = await searchParams;

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

        <JoinTeamForm initialInvitationId={invitationId} />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Got the wrong invite?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/onboarding/join"
        >
          Go back
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
