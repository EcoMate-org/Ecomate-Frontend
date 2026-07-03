import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

const submitSchema = z.object({
  description:   z.string().trim().min(1, "Description is required").max(1000),
  notes:         z.string().trim().max(500).optional(),
  proofImageUrl: z.string().url().optional().or(z.literal("")),
});

/**
 * POST /api/challenges/[id]/submit
 *
 * Submits proof of completion for a challenge.
 * User must have joined the challenge (ChallengeParticipant row must exist).
 * Multiple submissions per user are allowed (e.g. weekly updates).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id: challengeId } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { id: true, status: true, deadline: true },
  });

  if (!challenge)
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  if (challenge.status !== "ACTIVE" || challenge.deadline.getTime() <= Date.now())
    return NextResponse.json({ error: "This challenge is no longer active." }, { status: 409 });

  // Must have joined first
  const participation = await prisma.challengeParticipant.findUnique({
    where: { userId_challengeId: { userId: user.id, challengeId } },
  });
  if (!participation)
    return NextResponse.json(
      { error: "You must join this challenge before submitting proof." },
      { status: 403 },
    );

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const submission = await prisma.challengeSubmission.create({
    data: {
      challengeId,
      userId:        user.id,
      description:   parsed.data.description,
      notes:         parsed.data.notes,
      proofImageUrl: parsed.data.proofImageUrl || null,
    },
  });

  return NextResponse.json(
    {
      submission: {
        id:          submission.id,
        status:      submission.status,
        createdAt:   submission.createdAt.toISOString(),
      },
    },
    { status: 201 },
  );
}