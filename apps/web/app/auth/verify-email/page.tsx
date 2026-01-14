import Link from "next/link";
import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/verify-email/form";
import { Logo } from "@/components/core/logo";

export default function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Verify email</AuthCardTitle>
          </div>
          <AuthCardDescription>
            We sent a verification code to your email.
          </AuthCardDescription>
        </AuthCardHeader>

        <VerifyEmailForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Didn’t receive the email?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/auth/verify-email/resend"
        >
          Resend
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
