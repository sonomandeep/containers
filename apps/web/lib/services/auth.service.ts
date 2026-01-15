"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

const authRedirectUrl = "/auth/login";

export async function checkAuthentication() {
  const cookie = await cookies();
  const session = await auth.getSession({
    fetchOptions: {
      headers: {
        Cookie: cookie.toString(),
      },
    },
  });

  if (session.error) {
    logger.error(session, "error checking authentication");
    redirect(authRedirectUrl);
  }

  if (!session.data) {
    logger.debug(session, "user not authenticated");
    redirect(authRedirectUrl);
  }

  logger.debug(session, "user session");

  return session.data.user;
}
