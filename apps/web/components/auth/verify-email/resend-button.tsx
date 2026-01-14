"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ResendButtonProps = {
  cooldownSeconds?: number;
  className?: string;
};

export function ResendButton({ cooldownSeconds = 60 }: ResendButtonProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [remainingSeconds]);

  function handleResend() {
    if (remainingSeconds > 0) {
      return;
    }

    setRemainingSeconds(cooldownSeconds);
  }

  const label =
    remainingSeconds > 0 ? `Resend (${remainingSeconds}s)` : "Resend";

  return (
    <Button
      disabled={remainingSeconds > 0}
      onClick={handleResend}
      size="sm"
      type="button"
      variant="ghost"
    >
      {label}
    </Button>
  );
}
