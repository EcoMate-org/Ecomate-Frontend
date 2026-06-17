import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { consumeAuthToken } from "../../../../lib/auth/tokens";

/**
 * GET /api/auth/verify-email?token=<rawToken>
 *
 * Called by the app/verify-email page (client component) so it can show
 * a friendly success/error screen rather than a bare JSON response.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const result = await consumeAuthToken(token, "EMAIL_VERIFICATION");

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "This verification link is invalid.",
      expired: "This verification link has expired. Please request a new one.",
      already_used: "This verification link has already been used.",
    };
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return NextResponse.json({ verified: true });
}
