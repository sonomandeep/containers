import { Building2Icon, UsersIcon } from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/core/logo";

export default async function Page() {
  return (
    <div className="grid h-full w-full grid-cols-5">
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
          <div className="flex w-full flex-col gap-3 rounded-md border border-card-border bg-card p-3">
            <UsersIcon className="size-4" />

            <div className="flex flex-col gap-0.5">
              <h2>Join workspace</h2>
              <p className="text-muted-foreground text-xs">
                Enter an invite code or accept an invitation to collaborate with
                your team.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 rounded-md border border-card-border bg-card p-3">
            <Building2Icon className="size-4" />

            <div className="flex flex-col gap-0.5">
              <h2>Create workspace</h2>
              <p className="text-muted-foreground text-xs">
                Set up your organization and invite teammates in a few steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative col-span-3 bg-[url(/assets/clouds.jpg)]">
        <Image
          alt="Paper dashboard"
          className="object-cover object-left py-24 pl-24"
          fill
          priority
          sizes="66vw"
          src="/assets/mock.png"
        />
      </section>
    </div>
  );
}
