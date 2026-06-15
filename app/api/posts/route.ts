import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth/server";

/**
 * GET /api/posts
 *
 * Returns the community feed: all posts ordered newest-first, with
 * author info, like/comment/bookmark counts, and per-user flags
 * (hasLiked / hasBookmarked / isOwnPost) for the current session user.
 *
 * Query params:
 *   ?type=MOMENT|CHALLENGE_ANNOUNCEMENT|LISTING  (optional filter)
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get("type");

  const posts = await prisma.post.findMany({
    where: typeFilter
      ? { type: typeFilter as "MOMENT" | "CHALLENGE_ANNOUNCEMENT" | "LISTING" }
      : undefined,
    orderBy: { createdAt: "desc" },
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

  const formatted = posts.map((post) => ({
    id: post.id,
    type: post.type,
    text: post.text,
    imageUrl: post.imageUrl,
    location: post.location,
    createdAt: post.createdAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      firstName: post.author.firstName,
      lastName: post.author.lastName,
      companyName: post.author.companyName,
      role: post.author.role,
      imageFile: post.author.imageFile,
    },
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
  }));

  return NextResponse.json({ posts: formatted });
}