import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import LogoutButton from "../../../components/LogoutButton";

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
}
