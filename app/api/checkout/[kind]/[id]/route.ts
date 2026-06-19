import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

/**
 * POST /api/checkout/[kind]/[id]
 *
 * Demo checkout completion. `kind` is "item" | "artwork".
 *
 * Simulates a successful payment by, in a single transaction:
 *  - Creating a `COMPLETED` Order row (itemId or artworkId set accordingly).
 *  - For Items: setting `Item.status = SOLD`.
 *  - For fixed-price Artworks: setting `Artwork.isAvailable = false`
 *    (quantity is decremented; if it reaches 0 the artwork is marked
 *    unavailable — for simplicity we treat each artwork as quantity 1
 *    per purchase, matching the seeded data).
 *
 * No real payment provider is involved — this endpoint is called after the
 * client-side "Processing your payment…" animation completes.
 *
 * The dashboard stats route (/api/dashboard/stats) already derives
 * itemsRecycled / co2SavedKg / balance / communityRankPercent from
 * Item.status === SOLD and completed Orders where the current user is the
 * seller, so no separate "update dashboard" step is needed — the next
 * stats fetch will reflect this automatically.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { kind, id } = await params;
  const normalizedKind = kind.toLowerCase();

  if (normalizedKind !== "item" && normalizedKind !== "artwork") {
    return NextResponse.json({ error: "Invalid checkout kind" }, { status: 400 });
  }

  try {
    if (normalizedKind === "item") {
      const item = await prisma.item.findUnique({ where: { id } });

      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }
      if (item.status !== "AVAILABLE") {
        return NextResponse.json(
          { error: "This item is no longer available." },
          { status: 409 },
        );
      }
      if (item.userId === user.id) {
        return NextResponse.json(
          { error: "You cannot purchase your own listing." },
          { status: 403 },
        );
      }

      const totalAmount = item.pricePerQuantity.mul(item.quantity);

      const [order] = await prisma.$transaction([
        prisma.order.create({
          data: {
            itemId: item.id,
            buyerId: user.id,
            sellerId: item.userId,
            totalAmount,
            status: "COMPLETED",
          },
        }),
        prisma.item.update({
          where: { id: item.id },
          data: { status: "SOLD" },
        }),
      ]);

      return NextResponse.json({
        order: { id: order.id, totalAmount: order.totalAmount.toString(), status: order.status },
      });
    }

    // ── Artwork (fixed-price only — auctions settle via the bidding flow) ──
    const artwork = await prisma.artwork.findUnique({ where: { id } });

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }
    if (artwork.saleType !== "FIXED_PRICE") {
      return NextResponse.json(
        { error: "This artwork is sold via auction. Use the bidding page instead." },
        { status: 409 },
      );
    }
    if (!artwork.isAvailable) {
      return NextResponse.json(
        { error: "This artwork is no longer available." },
        { status: 409 },
      );
    }
    if (artwork.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot purchase your own listing." },
        { status: 403 },
      );
    }

    const price = artwork.fixedPrice ?? artwork.estimatedPrice;
    const remainingQuantity = artwork.quantity - 1;

    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          artworkId: artwork.id,
          buyerId: user.id,
          sellerId: artwork.userId,
          totalAmount: price,
          status: "COMPLETED",
        },
      }),
      prisma.artwork.update({
        where: { id: artwork.id },
        data: {
          quantity: remainingQuantity,
          isAvailable: remainingQuantity > 0,
        },
      }),
    ]);

    return NextResponse.json({
      order: { id: order.id, totalAmount: order.totalAmount.toString(), status: order.status },
    });
  } catch (err) {
    console.error("Checkout failed:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
