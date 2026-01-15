import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/verify-email/form";
import { ResendButton } from "@/components/auth/verify-email/resend-button";
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
            Click the button below to verify your email address.
          </AuthCardDescription>
        </AuthCardHeader>

        <VerifyEmailForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Didn’t receive the email?</span>
        <ResendButton cooldownSeconds={60} />
      </AuthCardFooter>
    </AuthCard>
  );
}
