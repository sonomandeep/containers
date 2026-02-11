import { AlertCircleIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/core/logo";
import { JoinInvitationDecisionForm } from "@/components/organizations/join/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { getInvitationPreview } from "@/lib/services/organizations.service";

type Props = {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ organizationName?: string; inviterEmail?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { invitationId } = await params;
  const { organizationName, inviterEmail } = await searchParams;
  const normalizedInvitationId = invitationId.trim();

  if (!normalizedInvitationId) {
    redirect("/onboarding/join");
  }

  const previewFromUrl = {
    organizationName: organizationName?.trim() || "",
    inviterEmail: inviterEmail?.trim() || "",
  };

  const hasPreviewFromUrl = Boolean(
    previewFromUrl.organizationName && previewFromUrl.inviterEmail
  );
  const invitation = hasPreviewFromUrl
    ? {
        data: previewFromUrl,
        error: null,
      }
    : await getInvitationPreview(normalizedInvitationId);

  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-6">
      <header className="inline-flex w-full gap-2">
        <Logo size={30} />
        <div className="flex flex-col">
          <h1>Join your team</h1>
          <p className="text-muted-foreground text-xs">
            Join a workspace with an invite.
          </p>
        </div>
      </header>

      {invitation.data ? (
        <JoinInvitationDecisionForm
          invitationId={normalizedInvitationId}
          inviterEmail={invitation.data.inviterEmail}
          organizationName={invitation.data.organizationName}
        />
      ) : (
        <Alert variant="destructive">
          <div className="inline-flex items-center gap-2">
            <AlertCircleIcon className="size-3" />
            <AlertTitle>
              {invitation.error || "Unable to load invitation details."}
            </AlertTitle>
          </div>
        </Alert>
      )}

      <div className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs">
        <span>Wrong invite?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/onboarding/join"
        >
          Go back
        </Link>
      </div>
    </section>
  );
}
