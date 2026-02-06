import { DeviceVerificationForm } from "@/components/agents/auth/device-form";
import {
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { Logo } from "@/components/core/logo";

type Props = {
  searchParams: { callbackUrl?: string; user_code?: string };
};

export default function Page({ searchParams }: Props) {
  return (
    <AuthCard className="pb-2">
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Device Verification</AuthCardTitle>
          </div>
          <AuthCardDescription>
            Approve this device to continue in your terminal.
          </AuthCardDescription>
        </AuthCardHeader>

        <DeviceVerificationForm
          callbackUrl={searchParams.callbackUrl || ""}
          userCode={searchParams.user_code || ""}
        />
      </AuthCardContent>
    </AuthCard>
  );
}
