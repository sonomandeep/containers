"use client";

import { CornerDownLeftIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function VerifyEmailForm() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const isMissingToken = token.length === 0;

  const handleSubmit = () => {
    if (isMissingToken) {
      return;
    }

    startTransition(() => {
      setTimeout(() => {
        console.log("Verify email token", token);
      }, 1000);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {isMissingToken ? (
        <p className="text-xs text-muted-foreground">
          The verification link is missing a token. Please open the link from
          your email again.
        </p>
      ) : null}

      <Button
        className="w-full"
        disabled={isPending || isMissingToken}
        onClick={handleSubmit}
        type="button"
      >
        Verify email
        {isPending ? (
          <Spinner className="size-3 opacity-60" />
        ) : (
          <CornerDownLeftIcon className="size-3 opacity-60" />
        )}
      </Button>
    </div>
  );
}
