import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/server";
import AppNav from "../../components/dash_components/AppNav";
import AppBottomNav from "../../components/dash_components/AppBottomNav";
import BiddingIndexView from "../../components/dash_components/BiddingIndexView";

/**
 * /bidding — index page listing all active auctions.
 *
 * This is the target of the bottom nav's "Bids" tab. Individual auctions
 * are viewed/bid on at /bidding/[id].
 */
export default async function BiddingIndexPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/bidding");

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <BiddingIndexView />
      <AppBottomNav />
    </div>
  );
}
