import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { consumeAuthToken } from "../../../../lib/auth/tokens";
import { hashPassword } from "../../../../lib/auth/password";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/reset-password
 *
 * Body: { token: string, password: string }
 *
 * Validates the PASSWORD_RESET token (single-use, time-limited — see
 * lib/auth/tokens.ts), then updates the user's passwordHash.
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
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const result = await consumeAuthToken(parsed.data.token, "PASSWORD_RESET");

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "This reset link is invalid.",
      expired: "This reset link has expired. Please request a new one.",
      already_used: "This reset link has already been used.",
    };
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });

  return NextResponse.json({ success: true });
}
