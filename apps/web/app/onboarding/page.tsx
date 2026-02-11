import { Building2Icon, type LucideIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/core/logo";

export default async function Page() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <section className="col-span-2 mx-auto flex w-sm flex-col items-center justify-center gap-6">
        <header className="inline-flex w-full gap-4">
          <Logo size={32} />
          <div className="flex flex-col">
            <h1>Infrastructure, without the complexity.</h1>
            <p className="text-muted-foreground text-xs">
              Create your workspace in seconds or join your team.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <OnboardingCard
            description="Enter an invitation ID or accept an invitation to collaborate with your team."
            href="/onboarding/join"
            icon={UsersIcon}
            title="Join workspace"
          />

          <OnboardingCard
            description="Set up your organization and invite teammates in a few steps."
            href="/onboarding/create"
            icon={Building2Icon}
            title="Create workspace"
          />
        </div>
      </section>
    </div>
  );
}

type OnboardingCardProps = {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

function OnboardingCard({
  href,
  icon: Icon,
  title,
  description,
}: OnboardingCardProps) {
  return (
    <Link
      className="flex w-full flex-col gap-3 rounded-md border border-card-border bg-card p-3 transition-colors duration-150 hover:border-black hover:bg-white focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:hover:border-white/40 dark:hover:bg-black"
      href={href}
    >
      <Icon className="size-4" />

      <div className="flex flex-col gap-0.5">
        <h2>{title}</h2>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </Link>
  );
}
