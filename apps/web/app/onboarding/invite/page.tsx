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
import { InviteMembersForm } from "@/components/organizations/invite/form";

export default async function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full gap-2">
            <Logo size={30} />
            <div className="flex flex-col">
              <AuthCardTitle>Invite your team</AuthCardTitle>
              <AuthCardDescription>
                Add emails and we'll send the invites.
              </AuthCardDescription>
            </div>
          </div>
        </AuthCardHeader>

        <InviteMembersForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Prefer to do this later?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/containers"
        >
          Skip
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
