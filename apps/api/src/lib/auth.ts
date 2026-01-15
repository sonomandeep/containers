import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import env from "@/env";
import { sendVerificationEmail } from "./services/auth.service";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.APP_URL],
  plugins: [
    emailOTP({
      // biome-ignore lint/suspicious/useAwait: async required but no need to await emails response
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          sendVerificationEmail({ email, otp });
        }
      },
    }),
  ],
});
