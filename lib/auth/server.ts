import "server-only";
import { cookies } from "next/headers";
import { prisma } from "../prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session";

/**
 * Public-safe shape of a user (never includes passwordHash).
 */
export type SafeUser = {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  registrationNumber: string | null;
  companyAddress: string | null;
  role: SessionPayload["role"];
  status: string;
  isVerified: boolean;
  imageFile: string | null;
  bio: string | null;
};

export const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  companyName: true,
  registrationNumber: true,
  companyAddress: true,
  role: true,
  status: true,
  isVerified: true,
  imageFile: true,
  bio: true,
} as const;

/** Issue a session cookie for the given user. */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/** Remove the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Read & verify the session payload from the request cookies. */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Resolve the currently authenticated user from the database.
 * Returns `null` if there is no valid session or the user no longer exists.
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSessionPayload();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: safeUserSelect,
  });

  return user as SafeUser | null;
}
