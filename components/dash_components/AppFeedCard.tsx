/*"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export type RoleBadge = "Individual" | "NGO" | "Company";

export interface FeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorImage?: string | null;
  role: RoleBadge;
  location?: string | null;
  timeAgo: string;
  text: string;
  image?: string | null;
  /** Present on marketplace posts 
  listing?: {
    title: string;
    meta: string;
    actionLabel: string;
    actionVariant: "green" | "purple";
  };
  likes: number;
  comments: number;
}

interface AppFeedCardProps {
  post: FeedPost;
}

const BADGE_STYLES: Record<RoleBadge, string> = {
  Individual: "bg-ecomate-500/15 text-green-400",
  NGO: "bg-blue-500/15 text-blue-400",
  Company: "bg-purple-500/15 text-purple-400",
};



export default function AppFeedCard({ post }: AppFeedCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleLike = () => {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <article className="overflow-hidden rounded-xl border border-white/8 bg-white/4">
      {/* Header }
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        {/* Avatar }
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
          {post.authorImage ? (
            <Image src={post.authorImage} alt={post.authorName} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[11px] font-semibold text-ecomate-500">
              {post.authorInitials}
            </span>
          )}
        </div>

        {/* Name + badge }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-white truncate">
              {post.authorName}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE_STYLES[post.role]}`}>
              {post.role}
            </span>
          </div>
          <p className="text-[11px] text-white/35 truncate">
            {[post.location, post.timeAgo].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Post text }
      <p className="px-3.5 pb-2.5 text-sm leading-relaxed text-white/80">
        {post.text}
      </p>

      {/* Optional image }
      {post.image && (
        <div className="relative h-44 w-full">
          <Image src={post.image} alt="Post image" fill className="object-cover" />
        </div>
      )}

      {/* Optional marketplace listing banner }
      {post.listing && (
        <div className="mx-3.5 mb-2.5 flex items-center justify-between rounded-xl border border-ecomate-500/20 bg-ecomate-500/8 px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-white">{post.listing.title}</p>
            <p className="text-[11px] text-white/50 mt-0.5">{post.listing.meta}</p>
          </div>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition active:scale-95 ${
              post.listing.actionVariant === "purple"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-ecomate-600 hover:bg-ecomate-700"
            }`}
          >
            {post.listing.actionLabel}
          </button>
        </div>
      )}

      {/* Actions }
      <div className="flex items-center gap-4 border-t border-white/5 px-3.5 py-2.5">
        <ActionBtn
          onClick={toggleLike}
          active={liked}
          activeClass="text-red-400"
        >
          <Heart size={15} className={liked ? "fill-red-400" : ""} />
          <span>{likeCount}</span>
        </ActionBtn>

        <ActionBtn>
          <MessageCircle size={15} />
          <span>{post.comments}</span>
        </ActionBtn>

        <ActionBtn>
          <Share2 size={15} />
          <span>Share</span>
        </ActionBtn>

        <ActionBtn
          className="ml-auto"
          onClick={() => setBookmarked((b) => !b)}
          active={bookmarked}
          activeClass="text-ecomate-400"
        >
          <Bookmark size={15} className={bookmarked ? "fill-ecomate-400" : ""} />
        </ActionBtn>
      </div>
    </article>
  );
}

// ── ActionBtn helper ───────────────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  active,
  activeClass,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeClass?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs transition ${
        active ? (activeClass ?? "text-ecomate-400") : "text-white/40 hover:text-white/60"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

*/

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import {
  type ApiPost,
  roleToBadge,
  timeAgo,
  authorDisplayName,
  authorInitials,
  postListingBanner,
} from "../../lib/feedHelpers";
import ShareSheet from "./ShareSheet";

interface AppFeedCardProps {
  post: ApiPost;
}

const BADGE_STYLES: Record<string, string> = {
  Individual: "bg-ecomate-500/15 text-green-400",
  NGO: "bg-blue-500/15 text-blue-400",
  Company: "bg-purple-500/15 text-purple-400",
};

export default function AppFeedCard({ post }: AppFeedCardProps) {
  const [liked, setLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.counts.likes);
  const [bookmarked, setBookmarked] = useState(post.hasBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(post.counts.bookmarks);
  const [actionError, setActionError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const badge = roleToBadge(post.author.role);
  const listing = postListingBanner(post);

  const toggleLike = async () => {
    if (post.isOwnPost) {
      setActionError("You can't like your own post");
      setTimeout(() => setActionError(null), 2000);
      return;
    }

    // Optimistic update
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setLiked(!next);
        setLikeCount((c) => (next ? c - 1 : c + 1));
        const json = await res.json().catch(() => null);
        setActionError(json?.error ?? "Something went wrong");
        setTimeout(() => setActionError(null), 2000);
        return;
      }
      const json = await res.json();
      setLiked(json.liked);
      setLikeCount(json.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount((c) => (next ? c - 1 : c + 1));
    }
  };

  const toggleBookmark = async () => {
    if (post.isOwnPost) {
      setActionError("You can't save your own post");
      setTimeout(() => setActionError(null), 2000);
      return;
    }

    const next = !bookmarked;
    setBookmarked(next);
    setBookmarkCount((c) => (next ? c + 1 : c - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
      if (!res.ok) {
        setBookmarked(!next);
        setBookmarkCount((c) => (next ? c - 1 : c + 1));
        const json = await res.json().catch(() => null);
        setActionError(json?.error ?? "Something went wrong");
        setTimeout(() => setActionError(null), 2000);
        return;
      }
      const json = await res.json();
      setBookmarked(json.bookmarked);
      setBookmarkCount(json.bookmarkCount);
    } catch {
      setBookmarked(!next);
      setBookmarkCount((c) => (next ? c - 1 : c + 1));
    }
  };

  return (
    <article className="overflow-hidden rounded-xl border border-white/8 bg-white/4">
      {/* Header */}
      <Link
        href={`/posts/${post.id}`}
        className="flex items-center gap-2 px-3 pt-2.5 pb-1.5 transition hover:bg-white/3"
      >
        {/* Avatar */}
        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
          {post.author.imageFile ? (
            <Image src={post.author.imageFile} alt={authorDisplayName(post.author)} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[10px] font-semibold text-ecomate-500">
              {authorInitials(post.author)}
            </span>
          )}
        </div>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-white truncate">
              {authorDisplayName(post.author)}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${BADGE_STYLES[badge]}`}>
              {badge}
            </span>
          </div>
          <p className="text-[10px] text-white/35 truncate">
            {[post.location, timeAgo(post.createdAt)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>

      {/* Post text */}
      <Link href={`/posts/${post.id}`}>
        <p className="px-3 pb-2 text-xs leading-relaxed text-white/80">
          {post.text}
        </p>
      </Link>

      {/* Optional image */}
      {post.imageUrl && (
        <Link href={`/posts/${post.id}`} className="relative block h-32 w-full">
          <Image src={post.imageUrl} alt="Post image" fill className="object-cover" />
        </Link>
      )}

      {/* Optional listing/challenge/artwork banner */}
      {listing && (
        <div className="mx-3 mb-2 flex items-center justify-between rounded-xl border border-ecomate-500/20 bg-ecomate-500/8 px-3 py-2">
          <div>
            <p className="text-xs font-semibold text-white">{listing.title}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{listing.meta}</p>
          </div>
          <button
            type="button"
            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold text-white transition active:scale-95 ${
              listing.actionVariant === "purple"
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-ecomate-600 hover:bg-ecomate-700"
            }`}
          >
            {listing.actionLabel}
          </button>
        </div>
      )}

      {/* Inline error toast */}
      {actionError && (
        <div className="mx-3 mb-2 rounded-lg bg-red-500/10 px-3 py-1.5 text-[10px] text-red-400">
          {actionError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3.5 border-t border-white/5 px-3 py-2">
        <ActionBtn
          onClick={toggleLike}
          active={liked}
          activeClass="text-red-400"
          disabledLook={post.isOwnPost}
        >
          <Heart size={13} className={liked ? "fill-red-400" : ""} />
          <span>{likeCount}</span>
        </ActionBtn>

        <Link
          href={`/posts/${post.id}`}
          className="flex items-center gap-1.5 text-[11px] text-white/40 transition hover:text-white/60"
        >
          <MessageCircle size={13} />
          <span>{post.counts.comments}</span>
        </Link>

        <ActionBtn onClick={() => setShareOpen(true)}>
          <Share2 size={13} />
          <span>Share</span>
        </ActionBtn>

        <ActionBtn
          className="ml-auto"
          onClick={toggleBookmark}
          active={bookmarked}
          activeClass="text-ecomate-400"
          disabledLook={post.isOwnPost}
        >
          <Bookmark size={13} className={bookmarked ? "fill-ecomate-400" : ""} />
          {bookmarkCount > 0 && <span>{bookmarkCount}</span>}
        </ActionBtn>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
        postText={post.text}
      />
    </article>
  );
}

// ── ActionBtn helper ───────────────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  active,
  activeClass,
  className,
  disabledLook,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeClass?: string;
  className?: string;
  disabledLook?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[11px] transition ${
        active
          ? (activeClass ?? "text-ecomate-400")
          : disabledLook
            ? "text-white/20"
            : "text-white/40 hover:text-white/60"
      } ${className ?? ""}`}
    >
      {children}
    </button>
  );
}