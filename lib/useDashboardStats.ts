"use client";

import { useEffect, useState } from "react";
import type { MaterialType } from "../generated/prisma/client";

export interface DashboardStatsResponse {
  user: {
    itemsRecycled: number;
    totalWeightKg: number;
    co2SavedKg: number;
    balance: number;
    communityRankPercent: number | null;
  };
  platform: {
    totalItemsRecycled: number;
    activeUsers: number;
    partnerCompanies: number;
  };
  impactThisMonth: {
    material: MaterialType;
    weightKg: number;
  }[];
  featuredPartners: {
    id: string;
    companyName: string | null;
    role: string;
    bio: string | null;
    companyAddress: string | null;
    imageFile: string | null;
  }[];
}

interface UseDashboardStatsResult {
  data: DashboardStatsResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches /api/dashboard/stats once on mount.
 * Returns loading/error state alongside the parsed response.
 */
export function useDashboardStats(): UseDashboardStatsResult {
  const [data, setData] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) {
          throw new Error(`Failed to load stats (${res.status})`);
        }
        const json: DashboardStatsResponse = await res.json();
        if (!cancelled) setData(json);
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
  }, []);

  return { data, loading, error };
}