import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

/**
 * POST /api/posts/[id]/bookmark
 *
 * Toggles a bookmark (save) on a post for the current user.
 * - If not yet bookmarked: creates a Bookmark row.
 * - If already bookmarked: removes it.
 *
 * Constraint: a user cannot bookmark their own post (returns 403).
 * Bookmarked posts are surfaced on the user's profile (Phase E / future).
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
      { error: "You cannot save your own post." },
      { status: 403 },
    );
  }

  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_postId: {
        userId: user.id,
        postId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    const count = await prisma.bookmark.count({ where: { postId } });
    return NextResponse.json({ bookmarked: false, bookmarkCount: count });
  }

  await prisma.bookmark.create({
    data: { userId: user.id, postId },
  });

  const count = await prisma.bookmark.count({ where: { postId } });

  return NextResponse.json({ bookmarked: true, bookmarkCount: count });
}