import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSession } from "@/lib/services/auth.service";

export async function proxy(request: NextRequest) {
  const { session } = await getSession();
  const pathname = request.nextUrl.pathname;
  const cookieHeader = request.headers.get("cookie") ?? "";

  if (session && pathname.startsWith("/auth")) {
    const activeWorkspaceSlug = await getActiveWorkspaceSlug(cookieHeader);
    const targetPath = activeWorkspaceSlug
      ? `/${activeWorkspaceSlug}/containers`
      : "/onboarding";

    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  if (!(session || pathname.startsWith("/auth"))) {
    const redirectUrl = new URL("/auth/login", request.url);
    const callbackUrl = `${pathname}${request.nextUrl.search}`;
    redirectUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

async function getActiveWorkspaceSlug(cookieHeader: string) {
  try {
    const { data } = await auth.organization.getFullOrganization({
      fetchOptions: {
        headers: {
          Cookie: cookieHeader,
        },
      },
    });

    if (typeof data?.slug === "string" && data.slug.length > 0) {
      return data.slug;
    }
  } catch {
    return null;
  }

  return null;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
