import Link from "next/link";
import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/form";
import { Logo } from "@/components/core/logo";

export default function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Forgot password</AuthCardTitle>
          </div>
          <AuthCardDescription>
            Enter your email and we&apos;ll send a reset link.
          </AuthCardDescription>
        </AuthCardHeader>

        <ForgotPasswordForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Remembered your password?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/auth/login"
        >
          Login
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
