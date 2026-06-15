import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

/**
 * POST /api/posts/[id]/like
 *
 * Toggles a like on a post for the current user.
 * - If not yet liked: creates a Like row (targetType: POST).
 * - If already liked: removes it.
 *
 * Constraint: a user cannot like their own post (returns 403).
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (post.authorId === user.id) {
    return NextResponse.json(
      { error: "You cannot like your own post." },
      { status: 403 },
    );
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType: "POST",
        targetId: postId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    const count = await prisma.like.count({
      where: { targetType: "POST", targetId: postId },
    });
    return NextResponse.json({ liked: false, likeCount: count });
  }

  await prisma.like.create({
    data: {
      userId: user.id,
      targetType: "POST",
      targetId: postId,
    },
  });

  const count = await prisma.like.count({
    where: { targetType: "POST", targetId: postId },
  });

  return NextResponse.json({ liked: true, likeCount: count });
}