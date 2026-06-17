"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X, MessageCircle, Clock } from "lucide-react";
import type { MarketListing } from "../../lib/marketTypes";
import { MATERIAL_LABELS } from "../../lib/marketTypes";
import ChatSheet from "./ChatSheet";

interface ProductDetailSidebarProps {
  open: boolean;
  onClose: () => void;
  listing: MarketListing | null;
  currentUserId: string;
  onOrder: (listing: MarketListing) => void;
}

function formatPrice(price: string): string {
  return `₦${Number(price).toLocaleString()}`;
}

function ownerName(owner: MarketListing["owner"]): string {
  if (owner.companyName) return owner.companyName;
  if (owner.firstName && owner.lastName) return `${owner.firstName} ${owner.lastName}`;
  if (owner.firstName) return owner.firstName;
  return owner.username;
}

function ownerInitials(owner: MarketListing["owner"]): string {
  return ownerName(owner).slice(0, 2).toUpperCase();
}

function timeRemaining(endTimeIso: string): string {
  const diffMs = new Date(endTimeIso).getTime() - Date.now();
  if (diffMs <= 0) return "Ended";

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/**
 * Detail sidebar that slides in from the left edge of the screen.
 *
 * Fetches the full listing via GET /api/market/[kind]/[id] for extra
 * fields (full image gallery) — falls back to the summary `listing` prop
 * while loading.
 */
export default function ProductDetailSidebar({
  open,
  onClose,
  listing,
  currentUserId,
  onOrder,
}: ProductDetailSidebarProps) {
  const [detail, setDetail] = useState<(MarketListing & { images?: string[] }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !listing) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const apiKind = listing.kind === "ITEM" ? "item" : "artwork";

    fetch(`/api/market/${apiKind}/${listing.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load"))))
      .then((json) => {
        if (!cancelled) setDetail(json.listing);
      })
      .catch(() => {
        if (!cancelled) setDetail(listing); // fall back to summary data
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, listing]);

  if (!open || !listing) return null;

  const data = detail ?? listing;
  const isAuction = data.kind === "ARTWORK_AUCTION";
  const isArtwork = data.kind !== "ITEM";
  const isOwnListing = data.owner.id === currentUserId;

  const materialLabel = isArtwork
    ? MATERIAL_LABELS.ART
    : data.materialType
      ? MATERIAL_LABELS[data.materialType]
      : null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sliding panel — from the left */}
      <div className="fixed left-0 top-0 z-50 h-full w-full overflow-y-auto bg-[#0d2818] shadow-2xl animate-in slide-in-from-left duration-200 sm:w-[420px] sm:border-r sm:border-white/10">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/8 bg-[#0a1f12] px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Product Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {/* Image */}
          <div className="relative h-56 w-full overflow-hidden rounded-xl bg-white/5">
            {data.imageUrl ? (
              <Image src={data.imageUrl} alt={data.title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                No image
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-xs text-white/60">Loading…</span>
              </div>
            )}
          </div>

          {/* Title + price */}
          <div className="mt-4 flex items-start justify-between gap-3">
            <h1 className="text-lg font-bold leading-snug text-white">{data.title}</h1>
            {!isAuction && data.price && (
              <span className="shrink-0 text-lg font-bold text-ecomate-400">
                {formatPrice(data.price)}
              </span>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <p className="mt-2 text-sm leading-relaxed text-white/65">{data.description}</p>
          )}

          {/* Metadata grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
            {materialLabel && <Meta label="Material" value={materialLabel} />}
            {data.quantity !== null && (
              <Meta label="Quantity" value={isArtwork ? `${data.quantity}` : `${data.quantity} kg`} />
            )}
            {data.location && <Meta label="Location" value={data.location} />}
            {!isArtwork && data.itemStatus && <Meta label="Status" value={data.itemStatus} />}
          </div>

          {/* Auction-specific info */}
          {isAuction && data.auction && (
            <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/8 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-purple-300">
                <Clock size={14} />
                {timeRemaining(data.auction.endTime)}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Meta label="Start Price" value={formatPrice(data.auction.startingBid)} />
                <Meta
                  label="Current Price"
                  value={
                    data.auction.currentHighestBid
                      ? formatPrice(data.auction.currentHighestBid)
                      : "No bids yet"
                  }
                  valueClassName="text-ecomate-400 font-semibold"
                />
                <Meta
                  label="Participants"
                  value={`${data.auction.participantCount}`}
                />
              </div>
            </div>
          )}

          {/* Owner */}
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 p-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-ecomate-500/30">
              {data.owner.imageFile ? (
                <Image src={data.owner.imageFile} alt={ownerName(data.owner)} fill className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-[#1a3a26] text-[11px] font-semibold text-ecomate-500">
                  {ownerInitials(data.owner)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{ownerName(data.owner)}</p>
              <p className="text-[11px] text-white/40">{data.owner.role}</p>
            </div>
            {!isOwnListing && (
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

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-2">
            {isOwnListing && (
              <p className="text-center text-xs text-white/40">
                This is your own listing.
              </p>
            )}

            {!isOwnListing && isAuction && (
              <>
                <Link
                  href={`/bidding/${data.id}`}
                  className="rounded-lg bg-purple-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-purple-700 active:scale-95"
                >
                  Place Bid
                </Link>
                <Link
                  href={`/bidding/${data.id}`}
                  className="rounded-lg border border-white/15 px-4 py-2.5 text-center text-xs font-medium text-white/70 transition hover:bg-white/8"
                >
                  For more details & tracking → open in bid page
                </Link>
              </>
            )}

            {!isOwnListing && !isAuction && (
              <button
                type="button"
                onClick={() => onOrder(data)}
                disabled={data.kind === "ITEM" && data.itemStatus !== "AVAILABLE"}
                className="rounded-lg bg-ecomate-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Order
              </button>
            )}
          </div>
        </div>
      </div>

      {!isOwnListing && (
        <ChatSheet
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          recipientId={data.owner.id}
          currentUserId={currentUserId}
        />
      )}
    </>
  );
}

function Meta({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-white/35">{label}</p>
      <p className={`mt-0.5 text-sm font-medium ${valueClassName ?? "text-white/85"}`}>{value}</p>
    </div>
  );
}
