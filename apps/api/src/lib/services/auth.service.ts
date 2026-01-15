import env from "@/env";
import { emailClient } from "@/lib/email";

export async function sendVerificationEmail({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  try {
    await emailClient.sendMail({
      from: env.EMAIL_FROM,
      to: email,
      subject: "Verify your email address",
      html: `<p>Verification code: ${otp}</p>`,
    });
  } catch (error) {
    console.error(error, "error while sending verification email");
  }
}
