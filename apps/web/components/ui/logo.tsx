"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

interface Props {
  size: number;
}

export default function Logo({ size }: Props) {
  // Render both variants and let Tailwind's `dark:` utilities choose the correct one
  // so SSR/CSR output stays in sync and we avoid theme checks on the client.
  return (
    <>
      <Image
        src="/logo-light.svg"
        alt="ACME Inc. logo"
        width={size}
        height={size}
        className="block dark:hidden"
        priority
      />
      <Image
        src="/logo-dark.svg"
        alt="ACME Inc. logo"
        width={size}
        height={size}
        className="hidden dark:block"
        priority
      />
    </>
  );
}
