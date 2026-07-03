import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth/server";
import type { ChallengeType } from "../../../generated/prisma/client";

/**
 * GET /api/challenges
 *
 * Returns all ACTIVE challenges with:
 *   - creator info (companyName, role, imageFile)
 *   - participant count
 *   - isJoined + userProgress for the current user
 *
 * Query params:
 *   ?type=QUANTITY|ACTION|COMMUNITY   (optional, omit = all)
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type");

  const VALID_TYPES: ChallengeType[] = ["QUANTITY", "ACTION", "COMMUNITY"];
  const typeFilter =
    typeParam && VALID_TYPES.includes(typeParam as ChallengeType)
      ? (typeParam as ChallengeType)
      : undefined;

  const challenges = await prisma.challenge.findMany({
    where: {
      status: "ACTIVE",
      ...(typeFilter ? { type: typeFilter } : {}),
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          companyName: true,
          role: true,
          imageFile: true,
        },
      },
      _count: {
        select: { participants: true },
      },
      // Only fetch the current user's own participant row
      participants: {
        where: { userId: user.id },
        select: { progress: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = challenges.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    type: c.type,
    rewardType: c.rewardType,
    reward: c.reward,
    targetValue: c.targetValue,
    unit: c.unit,
    imageUrl: c.imageUrl,
    deadline: c.deadline.toISOString(),
    status: c.status,
    createdAt: c.createdAt.toISOString(),
    creator: c.creator,
    participantCount: c._count.participants,
    isJoined: c.participants.length > 0,
    userProgress: c.participants[0]?.progress ?? null,
  }));

  return NextResponse.json({ challenges: formatted });
}