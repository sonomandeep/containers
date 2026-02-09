import Link from "next/link";
import {
  AuthCard,
  AuthCardContent,
  AuthCardFooter,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login/form";
import { Logo } from "@/components/core/logo";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Login</AuthCardTitle>
          </div>
        </AuthCardHeader>

        <LoginForm callbackUrl={callbackUrl || ""} />
      </AuthCardContent>

      <AuthCardFooter>
        <span>Don’t have an account yet?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/auth/signup"
        >
          Sign Up
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}
