"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gavel } from "lucide-react";
import { useCountdown, formatCountdown } from "../../lib/market/useCountdown";

interface AuctionListing {
  artworkId: string;
  title: string;
  imageUrl: string | null;
  startingBid: string;
  currentHighestBid: string | null;
  endTime: string;
  participantCount: number;
}

/**
 * Grid view of all active auctions — the /bidding index page.
 * Reuses GET /api/auctions (the same endpoint feeding the sidebar on the
 * auction detail page), without an exclusion filter.
 */
export default function BiddingIndexView() {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auctions?limit=50")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load auctions"))))
      .then((json) => {
        if (!cancelled) setAuctions(json.auctions);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load auctions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d2818] pb-24 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Gavel size={22} className="text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-purple-300 sm:text-3xl">Bidding</h1>
            <p className="mt-1 text-sm text-white/45">
              Browse live auctions for recycled art pieces
            </p>
          </div>
        </div>

        {error && <p className="mt-8 text-center text-sm text-red-400">{error}</p>}

        {!error && loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/4" />
            ))}
          </div>
        )}

        {!error && !loading && auctions.length === 0 && (
          <p className="mt-12 text-center text-sm text-white/35">
            No active auctions right now. Check back soon!
          </p>
        )}

        {!error && !loading && auctions.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <AuctionGridCard key={auction.artworkId} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuctionGridCard({ auction }: { auction: AuctionListing }) {
  const countdown = useCountdown(auction.endTime);
  const price = auction.currentHighestBid ?? auction.startingBid;

  return (
    <Link
      href={`/bidding/${auction.artworkId}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition hover:bg-white/8"
    >
      <div className="relative h-40 w-full bg-white/5">
        {auction.imageUrl ? (
          <Image src={auction.imageUrl} alt={auction.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
            No image
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${
            countdown.ended
              ? "bg-white/15 text-white/60"
              : "bg-purple-500/20 text-purple-300"
          }`}
        >
          {countdown.ended ? "Ended" : "Live"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-white">{auction.title}</h3>
        <p className="text-lg font-bold text-purple-300">₦{Number(price).toLocaleString()}</p>
        <p className="text-xs text-white/45">
          {auction.currentHighestBid ? "Current bid" : "Starting bid"}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
          <span>{formatCountdown(countdown)}</span>
          <span>
            {auction.participantCount} bidder{auction.participantCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}
