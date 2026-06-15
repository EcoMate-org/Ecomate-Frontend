"use client";

import { useState } from "react";
import { Heart, Share2, Bookmark } from "lucide-react";
import type { ApiPost } from "../../lib/feedHelpers";
import ShareSheet from "./ShareSheet";

interface PostDetailActionsProps {
  post: ApiPost;
}

export default function PostDetailActions({ post }: PostDetailActionsProps) {
  const [liked, setLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.counts.likes);
  const [bookmarked, setBookmarked] = useState(post.hasBookmarked);
  const [bookmarkCount, setBookmarkCount] = useState(post.counts.bookmarks);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const flashError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 2000);
  };

  const toggleLike = async () => {
    if (post.isOwnPost) {
      flashError("You can't like your own post");
      return;
    }

    const next = !liked;
    setLiked(next);
    setLikeCount((c) => (next ? c + 1 : c - 1));

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) {
        setLiked(!next);
        setLikeCount((c) => (next ? c - 1 : c + 1));
        const json = await res.json().catch(() => null);
        flashError(json?.error ?? "Something went wrong");
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
      flashError("You can't save your own post");
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
        flashError(json?.error ?? "Something went wrong");
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
    <>
      {error && (
        <p className="mb-2 text-xs text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={toggleLike}
          className={`flex items-center gap-2 text-sm transition ${
            liked ? "text-red-400" : post.isOwnPost ? "text-white/20" : "text-white/50 hover:text-white/70"
          }`}
        >
          <Heart size={18} className={liked ? "fill-red-400" : ""} />
          <span>{likeCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex items-center gap-2 text-sm text-white/50 transition hover:text-white/70"
        >
          <Share2 size={18} />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={toggleBookmark}
          className={`ml-auto flex items-center gap-2 text-sm transition ${
            bookmarked ? "text-ecomate-400" : post.isOwnPost ? "text-white/20" : "text-white/50 hover:text-white/70"
          }`}
        >
          <Bookmark size={18} className={bookmarked ? "fill-ecomate-400" : ""} />
          {bookmarkCount > 0 && <span>{bookmarkCount}</span>}
        </button>
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        postId={post.id}
        postText={post.text}
      />
    </>
  );
}