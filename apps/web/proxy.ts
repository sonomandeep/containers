import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const coockie = await cookies();
  const session = await auth.getSession({
    fetchOptions: {
      headers: {
        Cookie: coockie.toString(),
      },
    },
  });

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!session || session.data === null) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/containers"], // Specify the routes the middleware applies to
};
