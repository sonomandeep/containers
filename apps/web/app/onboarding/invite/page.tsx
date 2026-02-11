import Link from "next/link";
import { Logo } from "@/components/core/logo";
import { InviteMembersForm } from "@/components/organizations/invite/form";

export default async function Page() {
  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-6">
      <header className="inline-flex w-full gap-2">
        <Logo size={30} />
        <div className="flex flex-col">
          <h1>Invite your team</h1>
          <p className="text-muted-foreground text-xs">
            Add emails and we'll send the invites.
          </p>
        </div>
      </header>

      <InviteMembersForm />

      <div className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs">
        <span>Prefer to do this later?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/containers"
        >
          Skip
        </Link>
      </div>
    </section>
  );
}
