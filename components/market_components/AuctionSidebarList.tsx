"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gavel } from "lucide-react";
import { useCountdown, formatCountdown } from "../../lib/useCountdown";

interface OtherAuction {
  artworkId: string;
  title: string;
  imageUrl: string | null;
  startingBid: string;
  currentHighestBid: string | null;
  endTime: string;
  participantCount: number;
}

interface AuctionSidebarListProps {
  excludeArtworkId: string;
}

export default function AuctionSidebarList({ excludeArtworkId }: AuctionSidebarListProps) {
  const [auctions, setAuctions] = useState<OtherAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/auctions?excludeArtworkId=${encodeURIComponent(excludeArtworkId)}&limit=6`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((json) => {
        if (!cancelled) setAuctions(json.auctions);
      })
      .catch(() => {
        if (!cancelled) setAuctions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [excludeArtworkId]);

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-72 lg:shrink-0">
      <div className="flex items-center gap-2">
        <Gavel size={15} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Other Active Auctions</h3>
      </div>

      {loading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/4" />
          ))}
        </div>
      )}

      {!loading && auctions.length === 0 && (
        <p className="text-xs text-white/40">No other active auctions right now.</p>
      )}

      {!loading && auctions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {auctions.map((a) => (
            <AuctionSidebarCard key={a.artworkId} auction={a} />
          ))}
        </div>
      )}
    </aside>
  );
}

function AuctionSidebarCard({ auction }: { auction: OtherAuction }) {
  const countdown = useCountdown(auction.endTime);
  const price = auction.currentHighestBid ?? auction.startingBid;

  return (
    <Link
      href={`/bidding/${auction.artworkId}`}
      className="flex gap-3 rounded-xl border border-white/8 bg-white/4 p-2.5 transition hover:bg-white/8"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
        {auction.imageUrl ? (
          <Image src={auction.imageUrl} alt={auction.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] text-white/30">
            No image
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-xs font-semibold text-white">{auction.title}</p>
        <p className="mt-0.5 text-sm font-bold text-purple-300">
          ₦{Number(price).toLocaleString()}
        </p>
        <p className="text-[10px] text-white/40">
          {formatCountdown(countdown)} · {auction.participantCount} bidder
          {auction.participantCount === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
