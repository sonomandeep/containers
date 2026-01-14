import Link from "next/link";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup/form";
import { Logo } from "@/components/core/logo";

export default function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Sign Up</AuthCardTitle>
          </div>
        </AuthCardHeader>

        <SignupForm />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Already have an account?</span>
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
