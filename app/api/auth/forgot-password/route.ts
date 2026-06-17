import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { issueAuthToken } from "../../../../lib/auth/tokens";
import { sendEmail } from "../../../../lib/email/mailer";
import { passwordResetEmail } from "../../../../lib/email/templates";

const schema = z.object({ email: z.email() });

/**
 * POST /api/auth/forgot-password
 *
 * Body: { email: string }
 *
 * Always returns a generic success message, regardless of whether the
 * email exists, to avoid leaking which addresses have accounts.
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
    message: "If an account with that email exists, a password reset link has been sent.",
  });

  if (!user) {
    return genericResponse;
  }

  try {
    const rawToken = await issueAuthToken(user.id, "PASSWORD_RESET");
    const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${rawToken}`;
    const displayName = user.companyName ?? user.firstName ?? "there";
    const { subject, html, text } = passwordResetEmail(resetUrl, displayName);
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }

  return genericResponse;
}
