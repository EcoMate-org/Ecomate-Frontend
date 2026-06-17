"use client";

import Image from "next/image";
import {
  type MarketListing,
  listingStatusLabel,
  listingStatusBadgeClass,
  MATERIAL_LABELS,
} from "../../lib/market/marketTypes";

interface MarketProductCardProps {
  listing: MarketListing;
  onViewDetails: (listing: MarketListing) => void;
  onPrimaryAction: (listing: MarketListing) => void;
}

/** Formats a Decimal-string price as ₦ currency. */
function formatPrice(price: string): string {
  const n = Number(price);
  return `₦${n.toLocaleString()}`;
}

export default function MarketProductCard({
  listing,
  onViewDetails,
  onPrimaryAction,
}: MarketProductCardProps) {
  const statusLabel = listingStatusLabel(listing);
  const isAuction = listing.kind === "ARTWORK_AUCTION";
  const isArtwork = listing.kind !== "ITEM";

  const primaryLabel = isAuction ? "Place Bid" : "Order";

  const materialLabel = isArtwork
    ? MATERIAL_LABELS.ART
    : listing.materialType
      ? MATERIAL_LABELS[listing.materialType]
      : null;

  const priceDisplay = isAuction
    ? listing.auction?.currentHighestBid
      ? `${formatPrice(listing.auction.currentHighestBid)} (current)`
      : `${formatPrice(listing.auction?.startingBid ?? "0")} (starting)`
    : listing.price
      ? formatPrice(listing.price)
      : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4">
      {/* Image + status badge */}
      <div className="relative h-44 w-full bg-white/5">
        {listing.imageUrl ? (
          <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
            No image
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${listingStatusBadgeClass(statusLabel)}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug text-white sm:text-base">
          {listing.title}
        </h3>

        {listing.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/50">
            {listing.description}
          </p>
        )}

        <div className="mt-1 flex flex-col gap-1 text-xs text-white/60">
          {materialLabel && (
            <Row label="Material" value={materialLabel} />
          )}
          {listing.quantity !== null && (
            <Row label="Quantity" value={isArtwork ? `${listing.quantity}` : `${listing.quantity} kg`} />
          )}
          {listing.location && <Row label="Location" value={listing.location} />}
          {priceDisplay && (
            <Row
              label={isAuction ? "Bid" : "Price"}
              value={priceDisplay}
              valueClassName="text-ecomate-400 font-semibold"
            />
          )}
          {isAuction && listing.auction && (
            <Row
              label="Participants"
              value={`${listing.auction.participantCount}`}
            />
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(listing)}
            className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/8 active:scale-95"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onPrimaryAction(listing)}
            disabled={!isAuction && statusLabel !== "available"}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold text-white transition active:scale-95 ${
              isAuction
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-ecomate-600 hover:bg-ecomate-700 disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}:</span>
      <span className={valueClassName ?? "text-white/75"}>{value}</span>
    </div>
  );
}
