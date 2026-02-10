import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, deviceAuthorization, organization } from "better-auth/plugins";
import { db } from "@/db";
import env from "@/env";
import { sendVerificationEmail } from "./services/auth.service";

const crossSubDomainCookiesEnabled = env.AUTH_CROSS_SUBDOMAIN_COOKIES_ENABLED;
const crossSubDomainCookiesDomain = env.AUTH_CROSS_SUBDOMAIN_COOKIES_DOMAIN;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  trustedOrigins: [env.APP_URL],
  ...(crossSubDomainCookiesEnabled
    ? {
        advanced: {
          crossSubDomainCookies: {
            enabled: true,
            domain: crossSubDomainCookiesDomain,
          },
        },
      }
    : {}),
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,

    // biome-ignore lint/suspicious/useAwait: async required but no need to await emails response
    sendVerificationEmail: async ({ user, url }) => {
      const urlWithCallback = new URL(url);
      urlWithCallback.searchParams.set("callbackURL", env.APP_URL);

      sendVerificationEmail({
        email: user.email,
        url,
      });
    },
  },
  plugins: [
    bearer(),
    organization(),
    deviceAuthorization({
      verificationUri: new URL("/agents/auth", env.APP_URL).toString(),
      expiresIn: "3m",
    }),
  ],
});
