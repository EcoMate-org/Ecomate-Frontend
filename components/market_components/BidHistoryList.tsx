"use client";

import Image from "next/image";

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

interface BidHistoryListProps {
  bids: BidEntry[];
}

function bidderName(b: Bidder): string {
  if (b.companyName) return b.companyName;
  if (b.firstName && b.lastName) return `${b.firstName} ${b.lastName}`;
  if (b.firstName) return b.firstName;
  return b.username;
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BidHistoryList({ bids }: BidHistoryListProps) {
  if (bids.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/35">
        No bids yet. Be the first to bid on this piece.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {bids.map((bid, i) => (
        <div
          key={bid.id}
          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
            i === 0
              ? "border-purple-500/30 bg-purple-500/8"
              : "border-white/8 bg-white/4"
          }`}
        >
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/10">
            {bid.bidder.imageFile ? (
              <Image src={bid.bidder.imageFile} alt={bidderName(bid.bidder)} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[10px] font-semibold text-ecomate-500">
                {bidderName(bid.bidder).slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-semibold text-white">
                {bidderName(bid.bidder)}
              </span>
              {bid.isOwnBid && (
                <span className="rounded-full bg-ecomate-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-ecomate-400">
                  You
                </span>
              )}
              {i === 0 && (
                <span className="rounded-full bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-purple-300">
                  Highest
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/35">{timeAgo(bid.createdAt)}</p>
          </div>

          <span className="shrink-0 text-sm font-bold text-white">
            ₦{Number(bid.amount).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
