import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

const placeBidSchema = z.object({
  amount: z.number().positive("Bid amount must be greater than zero"),
});

/**
 * POST /api/auctions/[id]/bid
 *
 * `id` is the Artwork id. Body: { amount: number }.
 *
 * Validation rule: amount >= (currentHighestBid ?? startingBid) + minimumIncrement.
 * (When there are no bids yet, the floor is startingBid + minimumIncrement —
 * i.e. the first bid must still clear the increment over the starting price.)
 *
 * Rejects:
 *  - bidding on your own artwork (403)
 *  - auction not ACTIVE, or already past its endTime (409)
 *  - amount below the required minimum (422)
 *
 * On success: creates an ArtworkBid row and updates
 * ArtworkAuction.currentHighestBid in a transaction.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: artworkId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = placeBidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { auction: true },
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

  if (artwork.userId === user.id) {
    return NextResponse.json(
      { error: "You cannot bid on your own artwork." },
      { status: 403 },
    );
  }

  const auction = artwork.auction;

  if (auction.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "This auction is no longer active." },
      { status: 409 },
    );
  }

  if (auction.endTime.getTime() <= Date.now()) {
    return NextResponse.json(
      { error: "This auction has ended." },
      { status: 409 },
    );
  }

  const floor = (auction.currentHighestBid ?? auction.startingBid).add(
    auction.minimumIncrement,
  );
  const floorNumber = floor.toNumber();

  const amount = parsed.data.amount;

  if (amount < floorNumber) {
    return NextResponse.json(
      {
        error: `Bid must be at least ₦${floor.toString()} (current ${
          auction.currentHighestBid ? "highest bid" : "starting price"
        } + minimum increment of ₦${auction.minimumIncrement.toString()}).`,
        minimumBid: floor.toString(),
      },
      { status: 422 },
    );
  }

  try {
    const [bid] = await prisma.$transaction([
      prisma.artworkBid.create({
        data: {
          auctionId: auction.id,
          bidderId: user.id,
          amount,
        },
      }),
      prisma.artworkAuction.update({
        where: { id: auction.id },
        data: { currentHighestBid: amount },
      }),
    ]);

    return NextResponse.json(
      {
        bid: {
          id: bid.id,
          amount: bid.amount.toString(),
          createdAt: bid.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Bid placement failed:", err);
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 });
  }
}
