import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/server";
import AppNav from "../../components/dash_components/AppNav";
import CommunityFeed from "../../components/community/CommunityFeed";

/**
 * /community — social feed page.
 * Houses all posts (moments, listings, challenge announcements),
 * compose bar, sidebar stats, and feed tabs.
 */
export default async function CommunityPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/community");

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <CommunityFeed user={user} />
    </div>
  );
}