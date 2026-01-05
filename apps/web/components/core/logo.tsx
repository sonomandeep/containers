"use client";

import Image from "next/image";

interface Props {
  size: number;
}

export function Logo({ size }: Props) {
  // Render both variants and let Tailwind's `dark:` utilities choose the correct one
  // so SSR/CSR output stays in sync and we avoid theme checks on the client.
  return (
    <>
      <Image
        alt="ACME Inc. logo"
        className="block dark:hidden"
        width={size}
        height={size}
        priority
        src="/logo-light.svg"
      />
      <Image
        alt="ACME Inc. logo"
        className="hidden dark:block"
        width={size}
        height={size}
        priority
        src="/logo-dark.svg"
      />
    </>
  );
}
