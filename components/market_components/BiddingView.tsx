"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, MessageCircle, Clock, Users } from "lucide-react";
import { useCountdown, formatCountdown } from "../../lib/market/useCountdown";
import BidHistoryList from "./BidHistoryList";
import AuctionSidebarList from "./AuctionSidebarList";
import ChatSheet from "./ChatSheet";

interface Owner {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: string;
  imageFile: string | null;
  bio: string | null;
}

interface Bidder {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: string;
  imageFile: string | null;
}

interface BidEntry {
  id: string;
  amount: string;
  createdAt: string;
  bidder: Bidder;
  isOwnBid: boolean;
}

interface AuctionDetail {
  artwork: {
    id: string;
    title: string;
    description: string | null;
    images: string[];
    location: string | null;
    quantity: number;
    owner: Owner;
    isOwnArtwork: boolean;
  };
  auction: {
    id: string;
    startingBid: string;
    currentHighestBid: string | null;
    minimumIncrement: string;
    startTime: string;
    endTime: string;
    status: string;
    winner: Bidder | null;
    participantCount: number;
    bids: BidEntry[];
  };
}

interface BiddingViewProps {
  artworkId: string;
  currentUserId: string;
}

function ownerName(o: Owner): string {
  if (o.companyName) return o.companyName;
  if (o.firstName && o.lastName) return `${o.firstName} ${o.lastName}`;
  if (o.firstName) return o.firstName;
  return o.username;
}

export default function BiddingView({ artworkId, currentUserId }: BiddingViewProps) {
  const [data, setData] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchDetail = () => {
    setLoading(true);
    setLoadError(null);
    fetch(`/api/auctions/${artworkId}`)
      .then((res) => {
        if (!res.ok) return res.json().then((j) => Promise.reject(new Error(j?.error ?? "Failed to load")));
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artworkId]);

  const countdown = useCountdown(data?.auction.endTime ?? new Date().toISOString());

  const minimumBid = data
    ? Number(data.auction.currentHighestBid ?? data.auction.startingBid) +
      Number(data.auction.minimumIncrement)
    : 0;

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError(null);
    setBidSuccess(false);

    const amount = Number(bidAmount);
    if (!amount || amount <= 0) {
      setBidError("Enter a valid bid amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/auctions/${artworkId}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const json = await res.json();
      if (!res.ok) {
        setBidError(json?.error ?? "Failed to place bid");
        return;
      }

      setBidSuccess(true);
      setBidAmount("");
      fetchDetail(); // refresh auction + bid history
    } catch {
      setBidError("Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d2818] pb-24 text-white">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/8 bg-[#0a1f12] px-4">
        <Link
          href="/market"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/12"
        >
          <ArrowLeft size={15} />
        </Link>
        <span className="text-sm font-semibold text-white">Bidding</span>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {loading && (
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1 space-y-4">
              <div className="h-72 animate-pulse rounded-2xl bg-white/4" />
              <div className="h-32 animate-pulse rounded-2xl bg-white/4" />
            </div>
            <div className="h-48 w-full animate-pulse rounded-2xl bg-white/4 lg:w-72" />
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-6 text-center">
            <p className="text-sm font-semibold text-red-400">{loadError}</p>
            <Link
              href="/market"
              className="mt-4 inline-block rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/8"
            >
              Back to Marketplace
            </Link>
          </div>
        )}

        {!loading && !loadError && data && (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main content */}
            <div className="flex-1 space-y-4">
              {/* Image + auction status */}
              <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
                <div className="relative h-72 w-full bg-white/5 sm:h-96">
                  {data.artwork.images[0] ? (
                    <Image
                      src={data.artwork.images[0]}
                      alt={data.artwork.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                      No image
                    </div>
                  )}
                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                      countdown.ended || data.auction.status !== "ACTIVE"
                        ? "bg-white/15 text-white/60"
                        : "bg-purple-500/20 text-purple-300"
                    }`}
                  >
                    {countdown.ended || data.auction.status !== "ACTIVE" ? "Ended" : "Live Auction"}
                  </span>
                </div>

                <div className="p-4 sm:p-6">
                  <h1 className="text-xl font-bold text-white sm:text-2xl">{data.artwork.title}</h1>
                  {data.artwork.description && (
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {data.artwork.description}
                    </p>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat
                      icon={<Clock size={13} />}
                      label="Time Remaining"
                      value={formatCountdown(countdown)}
                      accent="text-purple-300"
                    />
                    <Stat
                      icon={<Users size={13} />}
                      label="Participants"
                      value={`${data.auction.participantCount}`}
                    />
                    <Stat label="Start Price" value={`₦${Number(data.auction.startingBid).toLocaleString()}`} />
                    <Stat
                      label="Current Price"
                      value={
                        data.auction.currentHighestBid
                          ? `₦${Number(data.auction.currentHighestBid).toLocaleString()}`
                          : "No bids yet"
                      }
                      accent="text-ecomate-400"
                    />
                  </div>

                  {data.artwork.location && (
                    <p className="mt-3 text-xs text-white/40">📍 {data.artwork.location}</p>
                  )}
                </div>
              </div>

              {/* Owner card */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 p-4">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
                  {data.artwork.owner.imageFile ? (
                    <Image
                      src={data.artwork.owner.imageFile}
                      alt={ownerName(data.artwork.owner)}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-xs font-semibold text-ecomate-500">
                      {ownerName(data.artwork.owner).slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{ownerName(data.artwork.owner)}</p>
                  <p className="text-[11px] text-white/40">{data.artwork.owner.role}</p>
                </div>
                {!data.artwork.isOwnArtwork && (
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-ecomate-500/15 text-ecomate-400 transition hover:bg-ecomate-500/25"
                    aria-label="Message seller"
                  >
                    <MessageCircle size={16} />
                  </button>
                )}
              </div>

              {/* Bid form */}
              {!data.artwork.isOwnArtwork && data.auction.status === "ACTIVE" && !countdown.ended && (
                <form
                  onSubmit={handlePlaceBid}
                  className="rounded-2xl border border-purple-500/20 bg-purple-500/8 p-4"
                >
                  <h2 className="text-sm font-semibold text-white">Place a Bid</h2>
                  <p className="mt-1 text-xs text-white/50">
                    Minimum bid: ₦{minimumBid.toLocaleString()} (current price + ₦
                    {Number(data.auction.minimumIncrement).toLocaleString()} increment)
                  </p>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="number"
                      min={minimumBid}
                      step="100"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder={`${minimumBid}`}
                      className="flex-1 rounded-lg border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white placeholder-white/35 outline-none transition focus:border-purple-400/40"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? "Placing…" : "Place Bid"}
                    </button>
                  </div>

                  {bidError && <p className="mt-2 text-xs text-red-400">{bidError}</p>}
                  {bidSuccess && (
                    <p className="mt-2 text-xs text-ecomate-400">Bid placed successfully!</p>
                  )}
                </form>
              )}

              {data.artwork.isOwnArtwork && (
                <p className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center text-xs text-white/40">
                  This is your own artwork — you can&apos;t bid on it.
                </p>
              )}

              {(countdown.ended || data.auction.status !== "ACTIVE") && (
                <p className="rounded-2xl border border-white/8 bg-white/4 p-4 text-center text-xs text-white/40">
                  {data.auction.winner
                    ? `Auction ended. Won by ${ownerName(data.auction.winner as unknown as Owner)}.`
                    : "This auction has ended."}
                </p>
              )}

              {/* Bid history */}
              <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                <h2 className="mb-3 text-sm font-semibold text-white">
                  Bid History ({data.auction.bids.length})
                </h2>
                <BidHistoryList bids={data.auction.bids} />
              </div>
            </div>

            {/* Sidebar: other active auctions */}
            <AuctionSidebarList excludeArtworkId={artworkId} />
          </div>
        )}
      </div>

      {data && !data.artwork.isOwnArtwork && (
        <ChatSheet
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          recipientId={data.artwork.owner.id}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-white/35">
        {icon}
        {label}
      </div>
      <p className={`mt-1 text-sm font-bold ${accent ?? "text-white"}`}>{value}</p>
    </div>
  );
}
