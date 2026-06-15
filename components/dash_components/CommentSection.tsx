"use client";

import Image from "next/image";
import { useState } from "react";
import { Send } from "lucide-react";
import {
  type PostAuthor,
  roleToBadge,
  timeAgo,
  authorDisplayName,
  authorInitials,
} from "../../lib/feedHelpers";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
}

interface CommentSectionProps {
  postId: string;
  initialComments: CommentItem[];
}

const BADGE_STYLES: Record<string, string> = {
  Individual: "bg-ecomate-500/15 text-green-400",
  NGO: "bg-blue-500/15 text-blue-400",
  Company: "bg-purple-500/15 text-purple-400",
};

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? "Failed to post comment");
        return;
      }

      const json = await res.json();
      setComments((prev) => [...prev, json.comment]);
      setText("");
    } catch {
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-b border-white/8 pb-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          maxLength={1000}
          className="flex-1 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white placeholder-white/35 outline-none transition focus:border-ecomate-500/40"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ecomate-600 text-white transition hover:bg-ecomate-700 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-white/35">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => {
            const badge = roleToBadge(comment.author.role);
            return (
              <div key={comment.id} className="flex gap-3">
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
                  {comment.author.imageFile ? (
                    <Image
                      src={comment.author.imageFile}
                      alt={authorDisplayName(comment.author)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[11px] font-semibold text-ecomate-500">
                      {authorInitials(comment.author)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {authorDisplayName(comment.author)}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${BADGE_STYLES[badge]}`}>
                      {badge}
                    </span>
                    <span className="text-[11px] text-white/35">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-white/80">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}