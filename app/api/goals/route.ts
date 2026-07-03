import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth/server";
import type { GoalPeriod, GoalType } from "../../../generated/prisma/client";

const createGoalSchema = z.object({
  title:       z.string().trim().min(1, "Title is required").max(120),
  type:        z.enum(["PRESET", "CUSTOM"]).default("CUSTOM"),
  targetValue: z.number().int().min(1).default(1),
  unit:        z.string().trim().max(30).optional(),
  period:      z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("WEEKLY"),
});

/**
 * GET /api/goals
 * Returns the current user's goals, newest first.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    goals: goals.map((g) => ({
      id:           g.id,
      title:        g.title,
      type:         g.type,
      targetValue:  g.targetValue,
      currentValue: g.currentValue,
      unit:         g.unit,
      period:       g.period,
      completedAt:  g.completedAt?.toISOString() ?? null,
      createdAt:    g.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/goals
 * Creates a new personal goal for the current user.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const goal = await prisma.goal.create({
    data: { ...parsed.data, userId: user.id },
  });

  return NextResponse.json(
    {
      goal: {
        id:           goal.id,
        title:        goal.title,
        type:         goal.type,
        targetValue:  goal.targetValue,
        currentValue: goal.currentValue,
        unit:         goal.unit,
        period:       goal.period,
        completedAt:  null,
        createdAt:    goal.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}