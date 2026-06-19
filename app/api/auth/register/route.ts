/*import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { signupSchema } from "../../../../lib/validations/auth";
import { hashPassword } from "../../../../lib/auth/password";
import { generateUniqueUsername } from "../../../../lib/auth/username";
import { verifyRegistrationNumber } from "../../../../lib/auth/registrationVerification";
import {
  setSessionCookie,
  safeUserSelect,
  type SafeUser,
} from "../../../../lib/auth/server";
import { dashboardPathForRole } from "../../../../lib/auth/session";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  // Unique email
  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(data.password);

  if (data.role === "USER") {
    const username = await generateUniqueUsername(email.split("@")[0]);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "USER",
        imageFile: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg"
      },
      select: safeUserSelect,
    });

    await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
    return NextResponse.json(
      { user: user as SafeUser, redirectTo: dashboardPathForRole("USER") },
      { status: 201 },
    );
  }

  // NGO / COMPANY
  const registrationNumber = data.registrationNumber.trim();

  // Unique registration number
  const existingReg = await prisma.user.findUnique({
    where: { registrationNumber },
    select: { id: true },
  });
  if (existingReg) {
    return NextResponse.json(
      { error: "This registration number is already registered." },
      { status: 409 },
    );
  }

  // External (CAC) verification — currently uniqueness-only. See
  // lib/auth/registrationVerification.ts for the integration point.
  const verification = await verifyRegistrationNumber(
    registrationNumber,
    data.role,
  );

  const username = await generateUniqueUsername(data.companyName);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      companyName: data.companyName,
      registrationNumber,
      companyAddress: data.companyAddress,
      role: data.role,
      isVerified: verification.verified,
      imageFile: "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
    },
    select: safeUserSelect,
  });

  await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
  return NextResponse.json(
    { user: user as SafeUser, redirectTo: dashboardPathForRole(data.role) },
    { status: 201 },
  );
}
*/

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { signupSchema } from "../../../../lib/validations/auth";
import { hashPassword } from "../../../../lib/auth/password";
import { generateUniqueUsername } from "../../../../lib/auth/username";
import { verifyRegistrationNumber } from "../../../../lib/auth/registrationVerification";
import { issueAuthToken } from "../../../../lib/auth/tokens";
import { sendEmail } from "../../../../lib/email/mailer";
import { verificationEmail } from "../../../../lib/email/templates";
import { safeUserSelect, type SafeUser } from "../../../../lib/auth/server";

/**
 * POST /api/auth/register
 *
 * CHANGED from the original version: no longer calls setSessionCookie()
 * immediately after creating the user. Instead, issues an
 * EMAIL_VERIFICATION token, emails a confirmation link, and returns
 * `{ requiresVerification: true }` so the signup page can show a
 * "check your inbox" screen instead of redirecting to a dashboard.
 *
 * The user can still be created and exists in the database — they just
 * can't log in (see app/api/auth/login/route.ts) until they click the
 * verification link, which sets `emailVerifiedAt`.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existingEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingEmail) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(data.password);

  let user: SafeUser;
  let displayName: string;

  if (data.role === "USER") {
    const username = await generateUniqueUsername(email.split("@")[0]);
    const created = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "USER",
        imageFile: "https://i.pinimg.com/736x/06/88/7c/06887c5974f2842d15d440160398cbfa.jpg",
      },
      select: safeUserSelect,
    });
    user = created as SafeUser;
    displayName = data.firstName;
  } else {
    // NGO / COMPANY
    const registrationNumber = data.registrationNumber.trim();

    const existingReg = await prisma.user.findUnique({
      where: { registrationNumber },
      select: { id: true },
    });
    if (existingReg) {
      return NextResponse.json(
        { error: "This registration number is already registered." },
        { status: 409 },
      );
    }

    const verification = await verifyRegistrationNumber(registrationNumber, data.role);

    const username = await generateUniqueUsername(data.companyName);
    const created = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        companyName: data.companyName,
        registrationNumber,
        companyAddress: data.companyAddress,
        role: data.role,
        isVerified: verification.verified,
        imageFile:
          "https://tse3.mm.bing.net/th/id/OIP.lS-UeOlf_GcwNcPUTpBJogHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
      },
      select: safeUserSelect,
    });
    user = created as SafeUser;
    displayName = data.companyName;
  }

  // ── Issue + send verification email ─────────────────────────────────────
  // Email delivery failure should not block account creation — the user
  // can use "Resend verification email" on the signup-success screen if
  // this fails (e.g. Gmail SMTP misconfigured, rate-limited, etc).
  try {
    const rawToken = await issueAuthToken(user.id, "EMAIL_VERIFICATION");
    const verifyUrl = `${process.env.APP_BASE_URL}/verify-email?token=${rawToken}`;
    const { subject, html, text } = verificationEmail(verifyUrl, displayName);
    await sendEmail({ to: user.email, subject, html, text });
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  return NextResponse.json(
    {
      requiresVerification: true,
      email: user.email,
      message: "Account created. Please check your email to verify your account before signing in.",
    },
    { status: 201 },
  );
}
