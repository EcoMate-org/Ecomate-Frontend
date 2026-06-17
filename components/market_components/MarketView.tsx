"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SafeUser } from "../../lib/auth/server";
import type { MarketListing } from "../../lib/market/marketTypes";
import { useMarketListings, type MarketFilters } from "../../lib/market/useMarketListings";
import MarketFilterBar from "./MarketFilterBar";
import MarketProductCard from "./MarketProductCard";
import ProductDetailSidebar from "./ProductDetailSidebar";

interface MarketViewProps {
  user: SafeUser;
}

/** Maps a listing to its checkout-route kind ("item" | "artwork"). */
function checkoutKind(listing: MarketListing): "item" | "artwork" {
  return listing.kind === "ITEM" ? "item" : "artwork";
}

export default function MarketView({ user }: MarketViewProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<MarketFilters>({});
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { listings, loading, error } = useMarketListings(filters);

  const openDetails = (listing: MarketListing) => {
    setSelectedListing(listing);
    setSidebarOpen(true);
  };

  const handlePrimaryAction = (listing: MarketListing) => {
    if (listing.kind === "ARTWORK_AUCTION") {
      router.push(`/bidding/${listing.id}`);
      return;
    }
    router.push(`/checkout/${checkoutKind(listing)}/${listing.id}`);
  };

  const handleOrder = (listing: MarketListing) => {
    router.push(`/checkout/${checkoutKind(listing)}/${listing.id}`);
  };

  return (
    <div className="min-h-screen bg-[#0d2818] pb-24 text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ecomate-300 sm:text-3xl">Marketplace</h1>
          <p className="mt-1 text-sm text-white/45">
            Browse recyclable materials and recycled art available for pickup or purchase
          </p>
        </div>

        {/* Filters */}
        <MarketFilterBar filters={filters} onChange={setFilters} />

        {/* Results count */}
        <p className="mt-4 text-sm text-white/40">
          {loading ? "Loading…" : `Showing ${listings.length} item${listings.length === 1 ? "" : "s"}`}
        </p>

        {/* Grid */}
        {error && (
          <p className="mt-8 text-center text-sm text-red-400">Failed to load marketplace: {error}</p>
        )}

        {!error && loading && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/4" />
            ))}
          </div>
        )}

        {!error && !loading && listings.length === 0 && (
          <div className="mt-12 text-center text-sm text-white/35">
            No listings match your filters.
          </div>
        )}

        {!error && !loading && listings.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <MarketProductCard
                key={`${listing.kind}-${listing.id}`}
                listing={listing}
                onViewDetails={openDetails}
                onPrimaryAction={handlePrimaryAction}
              />
            ))}
          </div>
        )}
      </div>

      <ProductDetailSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        listing={selectedListing}
        currentUserId={user.id}
        onOrder={handleOrder}
      />
    </div>
  );
}
