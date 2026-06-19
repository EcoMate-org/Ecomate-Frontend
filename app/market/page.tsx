import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/server";
import AppNav from "../../components/dash_components/AppNav";
import AppBottomNav from "../../components/dash_components/AppBottomNav";
import MarketView from "../../components/market_components/MarketView";

/**
 * /market — the Marketplace tab.
 *
 * Authenticated for all roles (USER, NGO, COMPANY can all browse and buy;
 * only USER can list items per the business rule, enforced in the
 * checkout/listing routes, not here).
 *
 * Reuses AppNav / AppBottomNav for a consistent shell with the user
 * dashboard. MarketView is a client component handling data fetching,
 * filtering, the detail sidebar, and checkout navigation.
 */
export default async function MarketPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/market");

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <MarketView user={user} />
      <AppBottomNav />
    </div>
  );
}
