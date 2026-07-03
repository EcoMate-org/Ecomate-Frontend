import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth/server";
import AppNav from "../../components/dash_components/AppNav";
import AppBottomNav from "../../components/dash_components/AppBottomNav";
import ChallengesView from "../../components/challenge_components/challengesView";

/**
 * /challenges — browse & join community challenges.
 *
 * All authenticated roles may browse and join. Only NGO/Company
 * can CREATE challenges (creation UI lives in their dashboards —
 * handled by teammates' routes, kept additive/separate).
 */
export default async function ChallengesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/challenges");

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <ChallengesView />
      <AppBottomNav />
    </div>
  );
}