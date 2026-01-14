"use server";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { LoginSchemaInput } from "@containers/shared";

export async function signIn({ email, password }: LoginSchemaInput) {
  const { data, error } = await auth.signIn.email({
    email,
    password,
  });

  if (error) {
    logger.error(error, "error while signing in");
    return { data: null, error: "Error" };
  }

  logger.debug(data);

  return { data, error: null };
}
