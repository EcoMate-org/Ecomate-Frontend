import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";

/**
 * GET /api/auctions/sellers
 *
 * Returns a deduplicated list of users who own artworks in active auctions.
 * Used by the Bidding page's "Top Sellers" section.
 *
 * Query params:
 *   ?limit=<n>   default 8
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

  // Fetch active auctions with their artwork owners
  const auctions = await prisma.artworkAuction.findMany({
    where: {
      status: "ACTIVE",
      endTime: { gt: new Date() },
    },
    include: {
      artwork: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              companyName: true,
              role: true,
              imageFile: true,
              bio: true,
            },
          },
          images: { take: 1, select: { imageUrl: true } },
        },
      },
      bids: { select: { bidderId: true }, distinct: ["bidderId"] },
    },
    orderBy: { currentHighestBid: "desc" },
    take: limit * 3, // fetch more to deduplicate by userId
  });

  // Deduplicate by userId, keep the one with the highest bid
  const seen = new Set<string>();
  const sellers: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    role: string;
    imageFile: string | null;
    bio: string | null;
    artworkTitle: string;
    artworkImageUrl: string | null;
    artworkId: string;
    currentHighestBid: string | null;
    participantCount: number;
  }[] = [];

  for (const auction of auctions) {
    const owner = auction.artwork.user;
    if (seen.has(owner.id)) continue;
    seen.add(owner.id);

    sellers.push({
      id: owner.id,
      username: owner.username,
      firstName: owner.firstName,
      lastName: owner.lastName,
      companyName: owner.companyName,
      role: owner.role,
      imageFile: owner.imageFile,
      bio: owner.bio,
      artworkTitle: auction.artwork.title,
      artworkImageUrl: auction.artwork.images[0]?.imageUrl ?? null,
      artworkId: auction.artwork.id,
      currentHighestBid: auction.currentHighestBid?.toString() ?? null,
      participantCount: auction.bids.length,
    });

    if (sellers.length >= limit) break;
  }

  return NextResponse.json({ sellers });
}