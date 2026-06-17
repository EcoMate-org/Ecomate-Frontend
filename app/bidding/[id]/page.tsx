import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import BiddingView from "../../../components/dash_components/BiddingView";

interface BiddingPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /bidding/[id] — auction detail + bid placement page.
 *
 * `id` is the Artwork id (matches the links used by the Marketplace's
 * "Place Bid" and "open in bid page" actions for ARTWORK_AUCTION
 * listings). Full validation that the artwork is actually an active
 * auction happens server-side in BiddingView via GET /api/auctions/[id].
 */
export default async function BiddingPage({ params }: BiddingPageProps) {
  const user = await getCurrentUser();
  const { id } = await params;
  if (!user) redirect(`/signin?next=/bidding/${id}`);

  return <BiddingView artworkId={id} currentUserId={user.id} />;
}
