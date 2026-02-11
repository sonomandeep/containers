import env from "@/env";
import { emailClient } from "@/lib/email";

export async function sendVerificationEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}) {
  try {
    await emailClient.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `<p>Verification url: <a href="${url}">Verify</a></p>`,
    });
  } catch (error) {
    console.error(error, "error while sending verification email");
  }
}

export async function sendOrganizationInvitationEmail({
  email,
  inviteLink,
  invitedByEmail,
  invitedByName,
  organizationName,
}: {
  email: string;
  inviteLink: string;
  invitedByEmail: string;
  invitedByName?: string | null;
  organizationName: string;
}) {
  try {
    const inviterName = invitedByName?.trim();
    const inviterLabel = inviterName
      ? `${inviterName} (${invitedByEmail})`
      : invitedByEmail;

    await emailClient.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: `Invitation to join ${organizationName}`,
      html: `<p>${inviterLabel} invited you to join <strong>${organizationName}</strong>.</p><p><a href="${inviteLink}">Accept invitation</a></p>`,
    });
  } catch (error) {
    console.error(error, "error while sending organization invitation email");
  }
}
