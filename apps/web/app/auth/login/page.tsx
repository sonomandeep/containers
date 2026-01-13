import Link from "next/link";
import { LoginForm } from "@/components/auth/login/form";
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
              <h1>Login</h1>
            </CardTitle>
          </div>
        </CardHeader>

        <LoginForm />
      </CardContent>

      <DialogFooter className="justify-center! text-muted-foreground">
        <span>Don’t have an account yet?</span>
        <Link
          className="underline transition-colors hover:text-foreground"
          href="/"
        >
          Sign Up
        </Link>
      </DialogFooter>
    </Card>
  );
}
