import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { loginSchema } from "../../../../lib/validations/auth";
import { verifyPassword } from "../../../../lib/auth/password";
import { setSessionCookie } from "../../../../lib/auth/server";
import { dashboardPathForRole } from "../../../../lib/auth/session";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message — do not reveal whether the email exists.
  const invalid = NextResponse.json(
    { error: "Invalid email or password." },
    { status: 401 },
  );

  if (!user) return invalid;

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return invalid;

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: `Your account is ${user.status.toLowerCase()}.` },
      { status: 403 },
    );
  }

  await setSessionCookie({ sub: user.id, email: user.email, role: user.role });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      companyName: user.companyName,
    },
    redirectTo: dashboardPathForRole(user.role),
  });
}
