import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth/server";

/**
 * GET /api/auctions
 *
 * Returns a lightweight list of ACTIVE auctions (artwork title/image,
 * current price, end time), for the bidding page's "other auctions"
 * sidebar.
 *
 * Query params:
 *   ?excludeArtworkId=<id>   omit this artwork from the results
 *   ?limit=<n>               default 6
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const excludeArtworkId = searchParams.get("excludeArtworkId");
  const limit = Math.min(Number(searchParams.get("limit") ?? 6), 20);

  const auctions = await prisma.artworkAuction.findMany({
    where: {
      status: "ACTIVE",
      endTime: { gt: new Date() },
      ...(excludeArtworkId ? { artworkId: { not: excludeArtworkId } } : {}),
    },
    include: {
      artwork: {
        include: {
          images: { take: 1, select: { imageUrl: true } },
        },
      },
      bids: { select: { bidderId: true }, distinct: ["bidderId"] },
    },
    orderBy: { endTime: "asc" },
    take: limit,
  });

  const listings = auctions.map((a) => ({
    artworkId: a.artworkId,
    title: a.artwork.title,
    imageUrl: a.artwork.images[0]?.imageUrl ?? null,
    startingBid: a.startingBid.toString(),
    currentHighestBid: a.currentHighestBid?.toString() ?? null,
    endTime: a.endTime.toISOString(),
    participantCount: a.bids.length,
  }));

  return NextResponse.json({ auctions: listings });
}
