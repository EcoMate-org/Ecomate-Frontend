import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";

const updateSchema = z.object({
  currentValue: z.number().int().min(0).optional(),
  increment:    z.boolean().optional(), // true = currentValue + 1
  complete:     z.boolean().optional(), // mark as done
});

/**
 * PATCH /api/goals/[id]
 * Update progress on a goal. Three modes:
 *   { increment: true }         → currentValue + 1 (capped at targetValue)
 *   { currentValue: N }         → set directly
 *   { complete: true }          → set completedAt = now
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal)                    return NextResponse.json({ error: "Goal not found" },    { status: 404 });
  if (goal.userId !== user.id)  return NextResponse.json({ error: "Forbidden" },         { status: 403 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 422 });
  }

  const { increment, complete, currentValue } = parsed.data;

  let newValue = goal.currentValue;
  if (increment) newValue = Math.min(goal.currentValue + 1, goal.targetValue);
  if (typeof currentValue === "number") newValue = Math.min(currentValue, goal.targetValue);

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      currentValue: newValue,
      completedAt: complete
        ? (goal.completedAt ?? new Date())
        : newValue >= goal.targetValue
          ? (goal.completedAt ?? new Date())
          : null,
    },
  });

  return NextResponse.json({
    goal: {
      id:           updated.id,
      currentValue: updated.currentValue,
      completedAt:  updated.completedAt?.toISOString() ?? null,
    },
  });
}

/**
 * DELETE /api/goals/[id]
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id }, select: { userId: true } });
  if (!goal)                   return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  if (goal.userId !== user.id) return NextResponse.json({ error: "Forbidden" },      { status: 403 });

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}