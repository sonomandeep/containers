import Link from "next/link";
import { Logo } from "@/components/core/logo";
import { CreateOrganizationForm } from "@/components/organizations/create/form";

export default async function Page() {
  return (
    <section className="mx-auto flex w-full max-w-2xs flex-col gap-6">
      <header className="inline-flex w-full gap-2">
        <Logo size={30} />
        <div className="flex flex-col">
          <h1>Set up your workspace</h1>
          <p className="text-muted-foreground text-xs">
            Fill the form to create your workspace.
          </p>
        </div>
      </header>

      <CreateOrganizationForm />

      <div className="inline-flex items-center justify-center gap-1 text-muted-foreground text-xs">
        <span>Already have a team?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/onboarding/join"
        >
          Join
        </Link>
      </div>
    </section>
  );
}
