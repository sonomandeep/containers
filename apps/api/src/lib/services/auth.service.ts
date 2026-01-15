import env from "@/env";
import { emailClient } from "@/lib/email";

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  try {
    await emailClient.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `<p>Verification url: <a href="${env.APP_URL}/auth/verify-email?token=${token}">Verify</a></p>`,
    });
  } catch (error) {
    console.error(error, "error while sending verification email");
  }
}
