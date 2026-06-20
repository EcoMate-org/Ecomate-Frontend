import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";
import type { MarketListing, ListingKind } from "../../../../../lib/market/marketTypes";

const OWNER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  companyName: true,
  role: true,
  imageFile: true,
  bio: true,
} as const;

/**
 * GET /api/market/[kind]/[id]
 *
 * `kind` is one of "item" | "artwork" (case-insensitive). For artworks the
 * route inspects `saleType` to return ARTWORK_FIXED or ARTWORK_AUCTION.
 *
 * Used by the product detail sidebar — returns the same `MarketListing`
 * shape as /api/market plus a couple of extra fields (full description,
 * all images) for the expanded view.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { kind, id } = await params;
  const normalizedKind = kind.toLowerCase();

  if (normalizedKind === "item") {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        images: { select: { imageUrl: true } },
        user: { select: OWNER_SELECT },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const listing: MarketListing & { images: string[] } = {
      id: item.id,
      kind: "ITEM",
      title: item.title,
      description: item.description,
      imageUrl: item.images[0]?.imageUrl ?? null,
      images: item.images.map((i) => i.imageUrl),
      materialType: item.materialType,
      quantity: item.quantity,
      itemStatus: item.status,
      location: item.location,
      price: item.pricePerQuantity.toString(),
      auction: null,
      owner: item.user,
      createdAt: item.createdAt.toISOString(),
    };

    return NextResponse.json({ listing });
  }

  if (normalizedKind === "artwork") {
    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        images: { select: { imageUrl: true } },
        user: { select: OWNER_SELECT },
        auction: {
          include: {
            bids: { select: { bidderId: true }, distinct: ["bidderId"] },
          },
        },
      },
    });

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const isAuction = artwork.saleType === "AUCTION";
    const listingKind: ListingKind = isAuction ? "ARTWORK_AUCTION" : "ARTWORK_FIXED";

    const listing: MarketListing & { images: string[] } = {
      id: artwork.id,
      kind: listingKind,
      title: artwork.title,
      description: artwork.description,
      imageUrl: artwork.images[0]?.imageUrl ?? null,
      images: artwork.images.map((i) => i.imageUrl),
      materialType: null,
      quantity: artwork.quantity,
      itemStatus: null,
      location: artwork.location,
      price: isAuction ? null : (artwork.fixedPrice ?? artwork.estimatedPrice).toString(),
      auction:
        isAuction && artwork.auction
          ? {
              startingBid: artwork.auction.startingBid.toString(),
              currentHighestBid: artwork.auction.currentHighestBid?.toString() ?? null,
              endTime: artwork.auction.endTime.toISOString(),
              status: artwork.auction.status,
              participantCount: artwork.auction.bids.length,
            }
          : null,
      owner: artwork.user,
      createdAt: artwork.createdAt.toISOString(),
    };

    return NextResponse.json({ listing });
  }

  return NextResponse.json({ error: "Invalid listing kind" }, { status: 400 });
}
