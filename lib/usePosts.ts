"use client";

import { useEffect, useState } from "react";
import type { ApiPost } from "./feedHelpers";

interface UsePostsResult {
  posts: ApiPost[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches /api/posts once on mount.
 * Optional `type` filters to MOMENT | CHALLENGE_ANNOUNCEMENT | LISTING.
 */
export function usePosts(type?: string): UsePostsResult {
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const url = type ? `/api/posts?type=${encodeURIComponent(type)}` : "/api/posts";
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to load posts (${res.status})`);
        }
        const json: { posts: ApiPost[] } = await res.json();
        if (!cancelled) setPosts(json.posts);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [type]);

  return { posts, loading, error };
}