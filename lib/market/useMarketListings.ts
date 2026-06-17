"use client";

import { useEffect, useState } from "react";
import type { MarketListing } from "./marketTypes";

export interface MarketFilters {
  material?: string; // PLASTIC | METAL | E_WASTE | GLASS | RUBBER | ART | undefined (all)
  status?: string; // AVAILABLE | RESERVED | SOLD | undefined (all)
  search?: string;
}

interface UseMarketListingsResult {
  listings: MarketListing[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches /api/market whenever the filters change. Debounces the `search`
 * field by 300ms so typing doesn't fire a request per keystroke.
 */
export function useMarketListings(filters: MarketFilters): UseMarketListingsResult {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(filters.search ?? ""), 300);
    return () => clearTimeout(handle);
  }, [filters.search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.material && filters.material !== "ALL") params.set("material", filters.material);
        if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/market?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load marketplace (${res.status})`);
        }
        const json: { listings: MarketListing[] } = await res.json();
        if (!cancelled) setListings(json.listings);
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
  }, [filters.material, filters.status, debouncedSearch]);

  return { listings, loading, error };
}
