"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

const authRedirectUrl = "/auth/login";

export async function getSession() {
  const cookieStore = await cookies();
  const session = await auth.getSession({
    fetchOptions: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  });

  return { ...session.data };
}

export async function checkAuthentication() {
  const cookieStore = await cookies();
  const session = await auth.getSession({
    fetchOptions: {
      headers: {
        Cookie: cookieStore.toString(),
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

  return { ...session.data, cookies: cookieStore };
}
