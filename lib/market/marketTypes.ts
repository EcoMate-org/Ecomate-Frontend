import type { MaterialType, ItemStatus, ArtworkSaleType } from "../../../generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────
// Unified marketplace listing shape.
//
// The Marketplace shows two underlying record types — `Item` (recyclable
// materials, sold at a fixed price-per-quantity) and `Artwork` (recycled
// art, either FIXED_PRICE or AUCTION via ArtworkSaleType). Both are mapped
// into this single `MarketListing` shape so the grid/card components don't
// need to branch on the source table.
// ─────────────────────────────────────────────────────────────────────────

export type ListingKind = "ITEM" | "ARTWORK_FIXED" | "ARTWORK_AUCTION";

export interface MarketListingOwner {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  role: string;
  imageFile: string | null;
  bio: string | null;
}

export interface MarketListing {
  id: string;
  kind: ListingKind;

  title: string;
  description: string | null;
  imageUrl: string | null;

  // Item-only
  materialType: MaterialType | null;
  quantity: number | null;
  itemStatus: ItemStatus | null;

  // Common
  location: string | null;

  // Pricing
  /** Price-per-quantity (Item) or fixedPrice/estimatedPrice (Artwork). */
  price: string | null;

  // Auction-only (ARTWORK_AUCTION)
  auction: {
    startingBid: string;
    currentHighestBid: string | null;
    endTime: string;
    status: string;
    participantCount: number;
  } | null;

  owner: MarketListingOwner;

  createdAt: string;
}

/** Display label shown on the status badge of a product card. */
export function listingStatusLabel(listing: MarketListing): string {
  if (listing.kind === "ARTWORK_AUCTION") return "Bid";

  if (listing.kind === "ITEM" && listing.itemStatus) {
    switch (listing.itemStatus) {
      case "AVAILABLE":
        return "available";
      case "RESERVED":
        return "pending";
      case "SOLD":
        return "collected";
      case "REMOVED":
        return "removed";
    }
  }

  // ARTWORK_FIXED
  return "available";
}

/** Badge color classes per status label — matches existing dark-green theme. */
export function listingStatusBadgeClass(label: string): string {
  switch (label) {
    case "available":
      return "bg-ecomate-500/15 text-ecomate-400";
    case "pending":
      return "bg-yellow-500/15 text-yellow-400";
    case "collected":
      return "bg-white/10 text-white/50";
    case "removed":
      return "bg-red-500/15 text-red-400";
    case "Bid":
      return "bg-purple-500/15 text-purple-400";
    default:
      return "bg-white/10 text-white/50";
  }
}

/** Material display label, including a synthetic "Recycled Art" category for artworks. */
export const MATERIAL_LABELS: Record<string, string> = {
  PLASTIC: "Plastic",
  GLASS: "Glass",
  METAL: "Metal",
  E_WASTE: "E-Waste",
  RUBBER: "Rubber",
  ART: "Recycled Art",
};
