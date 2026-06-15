/*import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import AppNav from "../../../components/dash_components/AppNav";
import UserFeed from "../../../components/dash_components/UserFeed";

export default async function UserDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard/user");
  if (user.role !== "USER") redirect(dashboardPathForRole(user.role));

 
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

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <AppNav user={user} />
      <UserFeed user={user} />
    </div>
  );
}
