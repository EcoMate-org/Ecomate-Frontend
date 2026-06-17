import "server-only";
import crypto from "crypto";
import { prisma } from "../prisma";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Generates a new token for the given purpose, stores only its hash, and
 * returns the RAW token (to be embedded in the email link). Any previous
 * unused tokens of the same purpose for this user are invalidated first,
 * so only the most recently issued link is ever valid — prevents a stale
 * "resend verification" email from a week ago still working.
 */
export async function issueAuthToken(
  userId: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const ttl = purpose === "EMAIL_VERIFICATION" ? EMAIL_VERIFICATION_TTL_MS : PASSWORD_RESET_TTL_MS;

  await prisma.$transaction([
    // Invalidate any prior unused tokens of this purpose for this user.
    prisma.authToken.updateMany({
      where: { userId, purpose, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.authToken.create({
      data: {
        userId,
        purpose,
        tokenHash,
        expiresAt: new Date(Date.now() + ttl),
      },
    }),
  ]);

  return rawToken;
}

export type ConsumeTokenResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "already_used" };

/**
 * Validates a raw token against the stored hash, checks expiry and
 * single-use status, and — if valid — marks it used. Callers should call
 * this exactly once per request; calling it twice for the same token will
 * correctly fail the second time with "already_used".
 */
export async function consumeAuthToken(
  rawToken: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
): Promise<ConsumeTokenResult> {
  const tokenHash = hashToken(rawToken);

  const record = await prisma.authToken.findUnique({ where: { tokenHash } });

  if (!record || record.purpose !== purpose) {
    return { ok: false, reason: "not_found" };
  }
  if (record.usedAt) {
    return { ok: false, reason: "already_used" };
  }
  if (record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  await prisma.authToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return { ok: true, userId: record.userId };
}
