import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <div className="inline-flex items-center gap-2">
          <Image
            alt="containers logo"
            className="block dark:hidden"
            height={20}
            priority
            src="/logo-light.svg"
            width={20}
          />
          <Image
            alt="containers logo"
            className="hidden dark:block"
            height={20}
            priority
            src="/logo-dark.svg"
            width={20}
          />
          <span className="font-semibold">containers</span>
        </div>
      ),
    },
  };
}
