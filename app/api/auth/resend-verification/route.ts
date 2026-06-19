import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { issueAuthToken } from "../../../../lib/auth/tokens";
import { sendEmail } from "../../../../lib/email/mailer";
import { verificationEmail } from "../../../../lib/email/templates";

const schema = z.object({ email: z.email() });

/**
 * POST /api/auth/resend-verification
 *
 * Body: { email: string }
 *
 * Always returns a generic success message regardless of whether the
 * email exists or is already verified, to avoid leaking account
 * existence to an unauthenticated caller (same pattern as login's
 * generic "invalid email or password").
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  const genericResponse = NextResponse.json({
    message: "If an account with that email exists and isn't yet verified, a new verification link has been sent.",
  });

  if (!user || user.emailVerifiedAt) {
    return genericResponse;
  }

  try {
    const rawToken = await issueAuthToken(user.id, "EMAIL_VERIFICATION");
    const verifyUrl = `${process.env.APP_BASE_URL}/verify-email?token=${rawToken}`;
    const displayName = user.companyName ?? user.firstName ?? "there";
    const { subject, html, text } = verificationEmail(verifyUrl, displayName);
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("Failed to resend verification email:", err);
  }

  return genericResponse;
}
