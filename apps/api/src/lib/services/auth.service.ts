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
