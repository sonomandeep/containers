import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, deviceAuthorization, organization } from "better-auth/plugins";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { member } from "@/db/schema";
import env from "@/env";
import {
  sendOrganizationInvitationEmail,
  sendVerificationEmail,
} from "./services/auth.service";

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
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const initialOrganizationId = await getInitialOrganizationId(
            session.userId
          );

          return {
            data: {
              ...session,
              activeOrganizationId: initialOrganizationId,
            },
          };
        },
      },
    },
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
    organization({
      async sendInvitationEmail(data) {
        const inviteUrl = new URL(
          `/onboarding/join/${encodeURIComponent(data.id)}`,
          env.APP_URL
        );

        await sendOrganizationInvitationEmail({
          email: data.email,
          inviteLink: inviteUrl.toString(),
          invitedByEmail: data.inviter.user.email,
          invitedByName: data.inviter.user.name,
          organizationName: data.organization.name,
        });
      },
    }),
    deviceAuthorization({
      verificationUri: new URL("/agents/auth", env.APP_URL).toString(),
      expiresIn: "3m",
    }),
  ],
});

async function getInitialOrganizationId(userId: string) {
  try {
    const memberships = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, userId))
      .orderBy(asc(member.createdAt))
      .limit(1);

    return memberships.at(0)?.organizationId ?? null;
  } catch {
    return null;
  }
}
