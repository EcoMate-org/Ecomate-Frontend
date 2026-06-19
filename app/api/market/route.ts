import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth/server";
import type { MaterialType, ItemStatus } from "../../../../generated/prisma/client";
import type { MarketListing } from "../../../lib/marketTypes";

/**
 * GET /api/market
 *
 * Returns a unified marketplace feed combining:
 *  - Item rows (status != REMOVED)
 *  - Artwork rows (isAvailable = true), split into FIXED_PRICE vs AUCTION
 *    based on `saleType`.
 *
 * Query params:
 *   ?material=PLASTIC|METAL|E_WASTE|GLASS|RUBBER|ART   (optional)
 *     - A specific MaterialType filters to Items only (matching that
 *       material). "ART" filters to Artworks only.
 *     - Omitted = all materials + all artworks.
 *   ?status=AVAILABLE|RESERVED|SOLD                     (optional, Item-only)
 *     - Applied only to Items; Artworks are unaffected (they use
 *       isAvailable / auction status instead of ItemStatus).
 *   ?search=<text>                                      (optional)
 *     - Case-insensitive match against title (and Item.description /
 *       Artwork.description).
 *   ?type=item|artwork|bid                              (optional)
 *     - "item" = Items only
 *     - "artwork" = fixed-price Artworks only
 *     - "bid" = auction Artworks only
 *     - omitted = everything
 *
 * Requires authentication (consistent with other /api routes in this app).
 */

const ITEM_OWNER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  companyName: true,
  role: true,
  imageFile: true,
  bio: true,
} as const;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const materialParam = searchParams.get("material");
  const statusParam = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const typeParam = searchParams.get("type"); // item | artwork | bid

  const includeItems = typeParam !== "artwork" && typeParam !== "bid";
  const includeFixedArtworks = typeParam !== "item" && typeParam !== "bid";
  const includeAuctionArtworks = typeParam !== "item" && typeParam !== "artwork";

  // Material filter only applies to Items, and only when it's a real
  // MaterialType (not the synthetic "ART" bucket).
  const materialFilter =
    materialParam && materialParam !== "ART" ? (materialParam as MaterialType) : undefined;

  // "ART" material filter means: Items are excluded entirely.
  const materialExcludesItems = materialParam === "ART";

  // Status filter only applies to Items.
  const statusFilter =
    statusParam && statusParam !== "ALL" ? (statusParam as ItemStatus) : undefined;

  const listings: MarketListing[] = [];

  // ── Items ──────────────────────────────────────────────────────────────
  if (includeItems && !materialExcludesItems) {
    const items = await prisma.item.findMany({
      where: {
        status: statusFilter ? statusFilter : { not: "REMOVED" },
        ...(materialFilter ? { materialType: materialFilter } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        images: { take: 1, select: { imageUrl: true } },
        user: { select: ITEM_OWNER_SELECT },
      },
      orderBy: { createdAt: "desc" },
    });

    for (const item of items) {
      listings.push({
        id: item.id,
        kind: "ITEM",
        title: item.title,
        description: item.description,
        imageUrl: item.images[0]?.imageUrl ?? null,
        materialType: item.materialType,
        quantity: item.quantity,
        itemStatus: item.status,
        location: item.location,
        price: item.pricePerQuantity.toString(),
        auction: null,
        owner: item.user,
        createdAt: item.createdAt.toISOString(),
      });
    }
  }

  // ── Artworks ───────────────────────────────────────────────────────────
  if (includeFixedArtworks || includeAuctionArtworks) {
    const artworks = await prisma.artwork.findMany({
      where: {
        isAvailable: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        images: { take: 1, select: { imageUrl: true } },
        user: { select: ITEM_OWNER_SELECT },
        auction: {
          include: {
            bids: { select: { bidderId: true }, distinct: ["bidderId"] },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    for (const artwork of artworks) {
      const isAuction = artwork.saleType === "AUCTION";

      if (isAuction && !includeAuctionArtworks) continue;
      if (!isAuction && !includeFixedArtworks) continue;

      if (isAuction) {
        if (!artwork.auction) continue; // data integrity guard
        listings.push({
          id: artwork.id,
          kind: "ARTWORK_AUCTION",
          title: artwork.title,
          description: artwork.description,
          imageUrl: artwork.images[0]?.imageUrl ?? null,
          materialType: null,
          quantity: artwork.quantity,
          itemStatus: null,
          location: artwork.location,
          price: null,
          auction: {
            startingBid: artwork.auction.startingBid.toString(),
            currentHighestBid: artwork.auction.currentHighestBid?.toString() ?? null,
            endTime: artwork.auction.endTime.toISOString(),
            status: artwork.auction.status,
            participantCount: artwork.auction.bids.length,
          },
          owner: artwork.user,
          createdAt: artwork.createdAt.toISOString(),
        });
      } else {
        listings.push({
          id: artwork.id,
          kind: "ARTWORK_FIXED",
          title: artwork.title,
          description: artwork.description,
          imageUrl: artwork.images[0]?.imageUrl ?? null,
          materialType: null,
          quantity: artwork.quantity,
          itemStatus: null,
          location: artwork.location,
          price: (artwork.fixedPrice ?? artwork.estimatedPrice).toString(),
          auction: null,
          owner: artwork.user,
          createdAt: artwork.createdAt.toISOString(),
        });
      }
    }
  }

  // Merge sort: newest first across both sources.
  listings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ listings });
}
