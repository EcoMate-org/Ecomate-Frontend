import { NextResponse } from "next/server";
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
    },
    select: safeUserSelect,
  });

  await setSessionCookie({ sub: user.id, email: user.email, role: user.role });
  return NextResponse.json(
    { user: user as SafeUser, redirectTo: dashboardPathForRole(data.role) },
    { status: 201 },
  );
}
