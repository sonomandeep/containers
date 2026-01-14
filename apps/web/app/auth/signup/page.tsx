import Link from "next/link";
import { SignupForm } from "@/components/auth/signup/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/core/card";
import { DialogFooter } from "@/components/core/dialog";
import { Logo } from "@/components/core/logo";

export default function Page() {
  return (
    <Card className="pt-1.5">
      <CardContent className="max-w-2xs">
        <CardHeader className="w-3xs">
          <div className="inline-flex w-full items-center gap-2">
            <Logo size={24} />
            <CardTitle>
              <h1>Sign Up</h1>
            </CardTitle>
          </div>
        </CardHeader>

        <SignupForm />
      </CardContent>

      <DialogFooter className="justify-center! text-muted-foreground">
        <span>Already have an account?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/auth/login"
        >
          Login
        </Link>
      </DialogFooter>
    </Card>
  );
}
