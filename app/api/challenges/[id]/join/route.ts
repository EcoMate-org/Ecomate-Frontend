import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

/**
 * POST /api/challenges/[id]/join
 *
 * Joins the current user to a challenge.
 * - Returns 409 if challenge is not ACTIVE or deadline has passed.
 * - Returns { joined: true, alreadyJoined: true } if already a participant.
 * - Returns { joined: true, alreadyJoined: false, participantCount } on success.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: challengeId } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, status: true, deadline: true },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  if (challenge.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "This challenge is no longer active." },
      { status: 409 },
    );
  }

  if (challenge.deadline.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "This challenge has ended." },
      { status: 409 },
    );
  }

  // Idempotent — return success if already joined
  const existing = await prisma.challengeParticipant.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
    select: { progress: true },
  });

  if (existing) {
    const count = await prisma.challengeParticipant.count({ where: { challengeId } });
    return NextResponse.json({
      joined: true,
      alreadyJoined: true,
      progress: existing.progress,
      participantCount: count,
    });
  }

  await prisma.challengeParticipant.create({
    data: { userId: user.id, challengeId },
  });

  const participantCount = await prisma.challengeParticipant.count({
    where: { challengeId },
  });

  return NextResponse.json(
    { joined: true, alreadyJoined: false, participantCount },
    { status: 201 },
  );
}