import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import LogoutButton from "../../../components/dash_components/LogoutButton";

export default async function CompanyDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard/company");
  if (user.role !== "COMPANY") redirect(dashboardPathForRole(user.role));

  return (
    <main className="min-h-screen bg-blue-600 text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">EcoMate</span>
        <LogoutButton />
      </header>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold">Welcome {user.companyName}!</h1>
        <p className="mt-2 text-lg text-blue-100">
          Registration Number: {user.registrationNumber}
        </p>
        <p className="mt-3 text-blue-100">
          List recyclable items, sponsor challenges, and track your environmental impact.
        </p>
        <div className="mt-8 rounded-xl bg-white/10 p-6 backdrop-blur">
          <p className="text-sm text-blue-100">Signed in as</p>
          <p className="text-lg font-medium">{user.email}</p>
          <p className="mt-2 text-sm text-blue-100">
            Verification status:{" "}
            <span className="font-medium">
              {user.isVerified ? "Verified" : "Pending (uniqueness-only)"}
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
