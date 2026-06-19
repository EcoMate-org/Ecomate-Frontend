import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";

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

const BIDDER_SELECT = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  companyName: true,
  role: true,
  imageFile: true,
} as const;

/**
 * GET /api/auctions/[id]
 *
 * `id` is the Artwork id (matching the route used by the Marketplace's
 * "Place Bid" / "open in bid page" links, e.g. /bidding/[artworkId]).
 *
 * Returns the artwork + its auction, full bid history (newest first) with
 * bidder display info, and the distinct-bidder participant count.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: artworkId } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: {
      images: { select: { imageUrl: true } },
      user: { select: OWNER_SELECT },
      auction: {
        include: {
          bids: {
            orderBy: { createdAt: "desc" },
            include: { bidder: { select: BIDDER_SELECT } },
          },
          winner: { select: BIDDER_SELECT },
        },
      },
    },
  });

  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  if (artwork.saleType !== "AUCTION" || !artwork.auction) {
    return NextResponse.json(
      { error: "This artwork is not listed for auction." },
      { status: 400 },
    );
  }

  const participantCount = new Set(artwork.auction.bids.map((b) => b.bidderId)).size;

  return NextResponse.json({
    artwork: {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      images: artwork.images.map((i) => i.imageUrl),
      location: artwork.location,
      quantity: artwork.quantity,
      owner: artwork.user,
      isOwnArtwork: artwork.userId === user.id,
    },
    auction: {
      id: artwork.auction.id,
      startingBid: artwork.auction.startingBid.toString(),
      currentHighestBid: artwork.auction.currentHighestBid?.toString() ?? null,
      minimumIncrement: artwork.auction.minimumIncrement.toString(),
      startTime: artwork.auction.startTime.toISOString(),
      endTime: artwork.auction.endTime.toISOString(),
      status: artwork.auction.status,
      winner: artwork.auction.winner,
      participantCount,
      bids: artwork.auction.bids.map((b) => ({
        id: b.id,
        amount: b.amount.toString(),
        createdAt: b.createdAt.toISOString(),
        bidder: b.bidder,
        isOwnBid: b.bidderId === user.id,
      })),
    },
  });
}
