/*import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import LogoutButton from "../../../components/dash_components/LogoutButton";

export default async function UserDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard/user");
  if (user.role !== "USER") redirect(dashboardPathForRole(user.role));

  return (
    <main className="min-h-screen bg-purple-600 text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">EcoMate</span>
        <LogoutButton />
      </header>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold">Welcome {user.firstName}!</h1>
        <p className="mt-3 text-purple-100">
          This is your individual dashboard. Scan items, list recyclables, join
          challenges and create recycled art.
        </p>
        <div className="mt-8 rounded-xl bg-white/10 p-6 backdrop-blur">
          <p className="text-sm text-purple-100">Signed in as</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
      </section>
    </main>
  );
}*/

import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import AppNav from "../../../components/dash_components/AppNav";
import UserFeed from "../../../components/dash_components/UserFeed";

export default async function UserDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard/user");
  if (user.role !== "USER") redirect(dashboardPathForRole(user.role));

  /**
   * Impact stats — replace these zeros with real DB queries once you
   * build an /api/stats endpoint. The fields don't exist on SafeUser,
   * so we pass static demo values for now that match your seeded data.
   */
  const stats = {
    itemsRecycled: 27,
    totalWeightKg: 156,
    co2SavedKg: 234,
  };

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <UserFeed user={user} stats={stats} />
    </div>
  );
}
