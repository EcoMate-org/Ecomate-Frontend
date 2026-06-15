import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "../../../lib/auth/server";
import { prisma } from "../../../lib/prisma";
import {
  roleToBadge,
  timeAgo,
  authorDisplayName,
  authorInitials,
  postListingBanner,
  type ApiPost,
} from "../../../lib/feedHelpers";
import PostDetailActions from "../../../components/dash_components/PostDetailActions";
import CommentSection from "../../../components/dash_components/CommentSection";

const BADGE_STYLES: Record<string, string> = {
  Individual: "bg-ecomate-500/15 text-green-400",
  NGO: "bg-blue-500/15 text-blue-400",
  Company: "bg-purple-500/15 text-purple-400",
};

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=/posts/${(await params).id}`);

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
        select: { id: true, title: true, pricePerQuantity: true, quantity: true, status: true },
      },
      challenge: {
        select: { id: true, title: true, reward: true, deadline: true },
      },
      artwork: {
        select: { id: true, title: true, fixedPrice: true, estimatedPrice: true },
      },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
      likes: { where: { userId: user.id }, select: { id: true } },
      bookmarks: { where: { userId: user.id }, select: { id: true } },
      comments: {
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
      },
    },
  });

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d2818] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Post not found</p>
          <Link href="/dashboard/user" className="mt-2 inline-block text-sm text-ecomate-400 hover:underline">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const apiPost: ApiPost = {
    id: post.id,
    type: post.type,
    text: post.text,
    imageUrl: post.imageUrl,
    location: post.location,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    item: post.item
      ? { ...post.item, pricePerQuantity: post.item.pricePerQuantity.toString() }
      : null,
    challenge: post.challenge
      ? { ...post.challenge, deadline: post.challenge.deadline.toISOString() }
      : null,
    artwork: post.artwork
      ? {
          ...post.artwork,
          fixedPrice: post.artwork.fixedPrice?.toString() ?? null,
          estimatedPrice: post.artwork.estimatedPrice.toString(),
        }
      : null,
    counts: {
      likes: post._count.likes,
      comments: post._count.comments,
      bookmarks: post._count.bookmarks,
    },
    isOwnPost: post.author.id === user.id,
    hasLiked: post.likes.length > 0,
    hasBookmarked: post.bookmarks.length > 0,
  };

  const badge = roleToBadge(post.author.role);
  const listing = postListingBanner(apiPost);

  const initialComments = post.comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
    author: c.author,
  }));

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/8 bg-[#0a1f12] px-4">
        <Link
          href="/dashboard/user"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/12"
        >
          <ArrowLeft size={15} />
        </Link>
        <span className="text-sm font-semibold text-white">Post</span>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Post */}
        <article className="rounded-2xl border border-white/8 bg-white/4 p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
              {post.author.imageFile ? (
                <Image
                  src={post.author.imageFile}
                  alt={authorDisplayName(post.author)}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-sm font-semibold text-ecomate-500">
                  {authorInitials(post.author)}
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-white">
                  {authorDisplayName(post.author)}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[badge]}`}>
                  {badge}
                </span>
              </div>
              <p className="text-xs text-white/40">
                {[post.location, timeAgo(post.createdAt.toISOString())].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {/* Text */}
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
            {post.text}
          </p>

          {/* Image */}
          {post.imageUrl && (
            <div className="relative mt-4 h-64 w-full overflow-hidden rounded-xl sm:h-80">
              <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
            </div>
          )}

          {/* Listing/challenge/artwork banner */}
          {listing && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-ecomate-500/20 bg-ecomate-500/8 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">{listing.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{listing.meta}</p>
              </div>
              <button
                type="button"
                className={`rounded-full px-4 py-2 text-xs font-semibold text-white transition active:scale-95 ${
                  listing.actionVariant === "purple"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-ecomate-600 hover:bg-ecomate-700"
                }`}
              >
                {listing.actionLabel}
              </button>
            </div>
          )}

          {/* Action bar (like, share, save — client component for interactivity) */}
          <div className="mt-4 border-t border-white/8 pt-3">
            <PostDetailActions post={apiPost} />
          </div>
        </article>

        {/* Comments */}
        <div className="mt-6 rounded-2xl border border-white/8 bg-white/4 p-4 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Comments ({post._count.comments})
          </h2>
          <CommentSection postId={post.id} initialComments={initialComments} />
        </div>
      </div>
    </div>
  );
}