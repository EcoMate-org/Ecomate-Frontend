import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

/**
 * GET /api/posts/[id]/comments
 *
 * Returns all comments on a post, oldest first (chronological thread),
 * with author info.
 */
export async function GET(
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
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          companyName: true,
          role: true,
          imageFile: true,
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

/**
 * POST /api/posts/[id]/comments
 *
 * Creates a new comment on a post. Body: { content: string }.
 * Users can comment on their own posts (no self-comment restriction —
 * only likes/bookmarks are restricted per product decision).
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
      },
      { status: 422 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: user.id,
      content: parsed.data.content,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          companyName: true,
          role: true,
          imageFile: true,
        },
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}