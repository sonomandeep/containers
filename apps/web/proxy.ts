import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/services/auth.service";

export async function proxy(request: NextRequest) {
  const { session } = await getSession();
  const pathname = request.nextUrl.pathname;

  if (session && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!(session || pathname.startsWith("/auth"))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
