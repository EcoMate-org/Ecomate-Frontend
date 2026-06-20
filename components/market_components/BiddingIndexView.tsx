/*"use client";

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
}*/


"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gavel, MessageCircle, TrendingUp } from "lucide-react";
import { useCountdown, formatCountdown } from "../../lib/market/useCountdown";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuctionListing {
  artworkId: string;
  title: string;
  imageUrl: string | null;
  startingBid: string;
  currentHighestBid: string | null;
  endTime: string;
  participantCount: number;
}

interface Seller {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: string;
  imageFile: string | null;
  bio: string | null;
  artworkTitle: string;
  artworkImageUrl: string | null;
  artworkId: string;
  currentHighestBid: string | null;
  participantCount: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function sellerDisplayName(s: Seller): string {
  if (s.companyName) return s.companyName;
  if (s.firstName && s.lastName) return `${s.firstName} ${s.lastName}`;
  if (s.firstName) return s.firstName;
  return s.username;
}

function sellerInitials(s: Seller): string {
  const name = sellerDisplayName(s);
  const words = name.trim().split(" ");
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Top Seller Card ────────────────────────────────────────────────────────────

function TopSellerCard({ seller }: { seller: Seller }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative shrink-0 w-24 sm:w-28 cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar image */}
      <Link href={`/profile/${seller.username}`}>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-2xl border-2 border-white/10 group-hover:border-ecomate-500/50 transition-all duration-200">
          {seller.imageFile ? (
            <Image
              src={seller.imageFile}
              alt={sellerDisplayName(seller)}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-lg font-bold text-ecomate-500">
              {sellerInitials(seller)}
            </div>
          )}

          {/* Hover overlay */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </Link>

      {/* Floating chat icon — visible on hover */}
      <Link
        href={`/bidding/${seller.artworkId}`}
        title={`View ${seller.artworkTitle}`}
        className={`absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ecomate-600 text-white shadow-lg transition-all duration-200 ${
          hovered ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
        }`}
      >
        <MessageCircle size={13} />
      </Link>

      {/* Username link below avatar */}
      <Link
        href={`/profile/${seller.username}`}
        className="mt-1.5 block text-center text-[11px] font-medium text-white/70 hover:text-ecomate-400 transition-colors truncate px-1"
      >
        @{seller.username}
      </Link>

      {/* Current bid indicator */}
      {seller.currentHighestBid && (
        <p className="text-center text-[10px] text-purple-300 truncate px-1">
          ₦{Number(seller.currentHighestBid).toLocaleString()}
        </p>
      )}
    </div>
  );
}

// ── Hot Bid Card ───────────────────────────────────────────────────────────────

function HotBidCard({ auction }: { auction: AuctionListing }) {
  const countdown = useCountdown(auction.endTime);
  const price = auction.currentHighestBid ?? auction.startingBid;

  return (
    <Link
      href={`/bidding/${auction.artworkId}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 hover:bg-white/8 hover:border-purple-500/30 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative h-44 w-full bg-white/5 overflow-hidden">
        {auction.imageUrl ? (
          <Image
            src={auction.imageUrl}
            alt={auction.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
            No image
          </div>
        )}

        {/* LIVE / Ended badge */}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            countdown.ended
              ? "bg-white/15 text-white/60"
              : "bg-purple-600/80 text-white backdrop-blur-sm"
          }`}
        >
          {countdown.ended ? "Ended" : "● Live"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-1">
          {auction.title}
        </h3>

        <p className="text-xl font-bold text-purple-300">
          ₦{Number(price).toLocaleString()}
        </p>
        <p className="text-[11px] text-white/40">
          {auction.currentHighestBid ? "Current bid" : "Starting bid"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/8">
          <span className="text-[11px] text-white/50">
            {formatCountdown(countdown)}
          </span>
          <span className="text-[11px] text-white/50">
            {auction.participantCount} bidder{auction.participantCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main View ──────────────────────────────────────────────────────────────────

/**
 * BiddingIndexView — the /bidding index page.
 *
 * Two sections:
 * 1. Top Sellers — horizontally scrollable row of users with active auctions.
 *    Each card has avatar + @username link → /profile/[username].
 *    A floating chat/view icon appears on hover over the avatar.
 *
 * 2. Hot Bids — responsive grid of active auction cards.
 *    Each card has artwork image, LIVE badge, current bid, countdown.
 */
export default function BiddingIndexView() {
  const [auctions, setAuctions] = useState<AuctionListing[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(true);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch active auctions
  useEffect(() => {
    let cancelled = false;

    fetch("/api/auctions?limit=50")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed to load auctions"))
      )
      .then((json) => {
        if (!cancelled) setAuctions(json.auctions);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load auctions");
      })
      .finally(() => {
        if (!cancelled) setAuctionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch top sellers
  useEffect(() => {
    let cancelled = false;

    fetch("/api/auctions/sellers?limit=8")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Failed to load sellers"))
      )
      .then((json) => {
        if (!cancelled) setSellers(json.sellers);
      })
      .catch(() => {
        // sellers are supplementary — fail silently
        if (!cancelled) setSellers([]);
      })
      .finally(() => {
        if (!cancelled) setSellersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0d2818] pb-28 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20">
            <Gavel size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Bidding</h1>
            <p className="mt-0.5 text-sm text-white/45">
              Browse live auctions for recycled art pieces
            </p>
          </div>
        </div>

        {/* ── Top Sellers ──────────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Top Sellers</h2>
            <Link
              href="/market?type=bid"
              className="text-xs font-medium text-ecomate-400 hover:text-ecomate-300 transition-colors"
            >
              View all →
            </Link>
          </div>

          {sellersLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="shrink-0 w-24 sm:w-28">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 animate-pulse rounded-2xl bg-white/8" />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-white/8 mx-auto" />
                </div>
              ))}
            </div>
          ) : sellers.length === 0 ? (
            <p className="text-sm text-white/35">No sellers active right now.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {sellers.map((seller) => (
                <TopSellerCard key={seller.id} seller={seller} />
              ))}
            </div>
          )}
        </section>

        {/* ── Hot Bids ─────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-ecomate-400" />
            <h2 className="text-base font-semibold text-white">Hot Bids</h2>
          </div>

          {error && (
            <p className="mt-8 text-center text-sm text-red-400">{error}</p>
          )}

          {!error && auctionsLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/4" />
              ))}
            </div>
          )}

          {!error && !auctionsLoading && auctions.length === 0 && (
            <div className="mt-12 flex flex-col items-center gap-3 text-center">
              <Gavel size={36} className="text-white/20" />
              <p className="text-sm text-white/35">
                No active auctions right now. Check back soon!
              </p>
            </div>
          )}

          {!error && !auctionsLoading && auctions.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {auctions.map((auction) => (
                <HotBidCard key={auction.artworkId} auction={auction} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
