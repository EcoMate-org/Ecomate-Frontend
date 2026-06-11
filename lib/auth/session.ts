import { SignJWT, jwtVerify } from "jose";

export type SessionRole = "USER" | "NGO" | "COMPANY" | "ADMIN";

export type SessionPayload = {
  /** user id */
  sub: string;
  email: string;
  role: SessionRole;
};

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "ecomate_session";

/** Session lifetime in seconds (7 days). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Map a role to its post-login dashboard path. */
export function dashboardPathForRole(role: SessionRole): string {
  switch (role) {
    case "NGO":
      return "/dashboard/ngo";
    case "COMPANY":
      return "/dashboard/company";
    case "ADMIN":
      return "/dashboard/admin";
    case "USER":
    default:
      return "/dashboard/user";
  }
}

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a strong value in your environment.",
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a session JWT (HS256). Pure `jose` — safe to use in the Edge
 * runtime (middleware) as well as in Node route handlers.
 */
export async function createSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/**
 * Verify a session JWT. Returns the payload or `null` if invalid/expired.
 */
export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as SessionRole,
    };
  } catch {
    return null;
  }
}
