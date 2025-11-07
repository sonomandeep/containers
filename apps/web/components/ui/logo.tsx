"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

interface Props {
  size: number;
}

export default function Logo({ size }: Props) {
  const { resolvedTheme } = useTheme();

  if (resolvedTheme === "light") {
    return (
      <Image src="/logo-light.svg" alt="ACME Inc. logo" width={size} height={size} />
    );
  }

  return (

    <Image src="/logo-dark.svg" alt="ACME Inc. logo" width={size} height={size} />
  );
}
