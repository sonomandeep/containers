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

export default async function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full gap-2">
            <Logo size={30} />
            <div className="flex flex-col">
              <AuthCardTitle>Set up your workspace</AuthCardTitle>
              <AuthCardDescription>
                Fill the form to create your workspace.
              </AuthCardDescription>
            </div>
          </div>
        </AuthCardHeader>
      </AuthCardContent>

      <AuthCardFooter>
        <span>Already have a team?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/auth/signup"
        >
          Join
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
