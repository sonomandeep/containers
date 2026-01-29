import {
  AuthCard,
  AuthCardContent,
  AuthCardHeader,
  AuthCardTitle,
} from "@/components/auth/auth-card";
import { DeviceVerificationForm } from "@/components/agents/auth/device-form";
import { Logo } from "@/components/core/logo";

export default function Page() {
  return (
    <AuthCard>
      <AuthCardContent>
        <AuthCardHeader>
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <AuthCardTitle>Device Verification</AuthCardTitle>
          </div>
        </AuthCardHeader>

        <DeviceVerificationForm />
      </AuthCardContent>
    </AuthCard>
  );
}
