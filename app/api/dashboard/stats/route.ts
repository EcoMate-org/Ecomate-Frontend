import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";
import { MaterialType } from "../../../../../generated/prisma/client";

/**
 * CO2 saved per kg of recycled material, by material type.
 *
 * These are approximate, commonly-cited figures (kg CO2e avoided per kg
 * material recycled vs. landfill/virgin production). Adjust as better
 * sourced figures become available — this is intentionally a single
 * constant map so it's easy to tune later.
 */
const CO2_FACTOR_PER_KG: Record<MaterialType, number> = {
  PLASTIC: 1.5,
  METAL: 4.0,
  E_WASTE: 2.5,
  GLASS: 0.3,
  RUBBER: 1.2,
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = user.id;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // ── Per-user: sold items (Items Recycled = completed sales) ──────────────
  const soldItems = await prisma.item.findMany({
    where: { userId, status: "SOLD" },
    select: { quantity: true, materialType: true },
  });

  const itemsRecycled = soldItems.length;
  const totalWeightKg = soldItems.reduce((sum, i) => sum + i.quantity, 0);
  const co2SavedKg = soldItems.reduce(
    (sum, i) => sum + i.quantity * CO2_FACTOR_PER_KG[i.materialType],
    0,
  );

  // ── Per-user: balance from completed orders as seller ─────────────────────
  const completedSales = await prisma.order.findMany({
    where: { sellerId: userId, status: "COMPLETED" },
    select: { totalAmount: true },
  });

  const balance = completedSales.reduce(
    (sum, o) => sum + Number(o.totalAmount),
    0,
  );

  // ── Per-user: community rank (percentile by total weight recycled) ───────
  // Group all SOLD items by user, sum quantity, then find this user's rank.
  const allUserWeights = await prisma.item.groupBy({
    by: ["userId"],
    where: { status: "SOLD" },
    _sum: { quantity: true },
  });

  const sortedWeights = allUserWeights
    .map((u) => ({ userId: u.userId, weight: u._sum.quantity ?? 0 }))
    .sort((a, b) => b.weight - a.weight);

  const totalRankedUsers = sortedWeights.length || 1;
  const userRankIndex = sortedWeights.findIndex((u) => u.userId === userId);
  const communityRankPercent =
    userRankIndex === -1
      ? null
      : Math.max(1, Math.round(((userRankIndex + 1) / totalRankedUsers) * 100));

  // ── Platform-wide: quick stats ────────────────────────────────────────────
  const [totalItemsRecycled, activeUsers, partnerCompanies] = await Promise.all([
    prisma.item.count({ where: { status: "SOLD" } }),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: { in: ["NGO", "COMPANY"] } } }),
  ]);

  // ── Platform-wide: impact this month, grouped by material type ───────────
  const monthlyByMaterial = await prisma.item.groupBy({
    by: ["materialType"],
    where: { status: "SOLD", updatedAt: { gte: startOfMonth } },
    _sum: { quantity: true },
  });

  const impactThisMonth = monthlyByMaterial.map((m) => ({
    material: m.materialType,
    weightKg: m._sum.quantity ?? 0,
  }));

  // ── Featured partners (verified NGOs / Companies) ─────────────────────────
  const featuredPartners = await prisma.user.findMany({
    where: {
      role: { in: ["NGO", "COMPANY"] },
      isVerified: true,
    },
    select: {
      id: true,
      companyName: true,
      role: true,
      bio: true,
      companyAddress: true,
      imageFile: true,
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    user: {
      itemsRecycled,
      totalWeightKg,
      co2SavedKg: Math.round(co2SavedKg),
      balance,
      communityRankPercent,
    },
    platform: {
      totalItemsRecycled,
      activeUsers,
      partnerCompanies,
    },
    impactThisMonth,
    featuredPartners,
  });
}