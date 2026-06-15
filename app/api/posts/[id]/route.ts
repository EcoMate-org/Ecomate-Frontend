import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";

/**
 * GET /api/posts/[id]
 *
 * Returns a single post with full author info, counts, and per-user
 * like/bookmark flags. Used by the Twitter-style post detail page
 * (app/posts/[id]/page.tsx).
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
      item: {
        select: {
          id: true,
          title: true,
          pricePerQuantity: true,
          quantity: true,
          status: true,
        },
      },
      challenge: {
        select: {
          id: true,
          title: true,
          reward: true,
          deadline: true,
        },
      },
      artwork: {
        select: {
          id: true,
          title: true,
          fixedPrice: true,
          estimatedPrice: true,
        },
      },
      _count: {
        select: { likes: true, comments: true, bookmarks: true },
      },
      likes: {
        where: { userId: user.id },
        select: { id: true },
      },
      bookmarks: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    post: {
      id: post.id,
      type: post.type,
      text: post.text,
      imageUrl: post.imageUrl,
      location: post.location,
      createdAt: post.createdAt,
      author: post.author,
      item: post.item,
      challenge: post.challenge,
      artwork: post.artwork,
      counts: {
        likes: post._count.likes,
        comments: post._count.comments,
        bookmarks: post._count.bookmarks,
      },
      isOwnPost: post.author.id === user.id,
      hasLiked: post.likes.length > 0,
      hasBookmarked: post.bookmarks.length > 0,
    },
  });
}