import { AlertCircleIcon, ArrowRightIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { listPendingJoinInvitations } from "@/lib/services/organizations.service";

type PendingInvitationItem = {
  id: string;
  organizationName: string;
  organizationSlug: string;
};

export default async function Page() {
  const { data: pendingInvitations, error: pendingInvitationsError } =
    await listPendingJoinInvitations();
  const invitations: Array<PendingInvitationItem> = pendingInvitations ?? [];

  const content = (() => {
    if (pendingInvitationsError) {
      return (
        <Empty className="rounded-md border border-card-border border-dashed bg-card/50">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <AlertCircleIcon className="size-4" />
            </EmptyMedia>
            <EmptyTitle>Unable to load invitations</EmptyTitle>
            <EmptyDescription>{pendingInvitationsError}</EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Link
              className="inline-flex items-center gap-1 underline transition-colors hover:text-foreground"
              href="/onboarding/join"
            >
              Try again
              <ArrowRightIcon className="size-3" />
            </Link>
          </EmptyContent>
        </Empty>
      );
    }

    if (invitations.length > 0) {
      return (
        <div className="flex flex-col gap-2">
          {invitations.map((invitation) => {
            const organizationInitial =
              invitation.organizationName.trim().charAt(0) || "A";

            return (
              <Link
                className="inline-flex w-full items-center justify-between gap-3 rounded-md border border-transparent bg-transparent p-2.5 transition-colors duration-150 hover:border-card-border hover:bg-card focus-visible:border-card-border focus-visible:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                href={`/onboarding/join/${encodeURIComponent(invitation.id)}`}
                key={invitation.id}
              >
                <div className="inline-flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-9 after:rounded-md">
                    <AvatarFallback className="rounded-md font-medium font-mono uppercase">
                      {organizationInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">
                      {invitation.organizationName}
                    </p>
                    <p className="truncate font-mono text-muted-foreground text-xs">
                      paper.mando.sh/{invitation.organizationSlug}
                    </p>
                  </div>
                </div>

                <ArrowRightIcon className="size-3 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      );
    }

    return (
      <Empty className="rounded-md border border-card-border border-dashed bg-card/50">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UsersIcon className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No invitations yet</EmptyTitle>
          <EmptyDescription>
            You do not have pending workspace invitations right now.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Link
            className="inline-flex items-center gap-1 underline transition-colors hover:text-foreground"
            href="/onboarding/create"
          >
            Create your workspace
            <ArrowRightIcon className="size-3" />
          </Link>
        </EmptyContent>
      </Empty>
    );
  })();

  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-4">
      <h1 className="sr-only">Join your team</h1>
      {content}
    </section>
  );
}
