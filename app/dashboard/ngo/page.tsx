import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth/server";
import { dashboardPathForRole } from "../../../lib/auth/session";
import LogoutButton from "../../../components/LogoutButton";

export default async function NgoDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin?next=/dashboard/ngo");
  if (user.role !== "NGO") redirect(dashboardPathForRole(user.role));

  return (
    <main className="min-h-screen bg-green-600 text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-bold">EcoMate</span>
        <LogoutButton />
      </header>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-bold">Welcome {user.companyName}!</h1>
        <p className="mt-2 text-lg text-green-100">
          Registration Number: {user.registrationNumber}
        </p>
        <p className="mt-3 text-green-100">
          Create environmental challenges, sponsor rewards and bid for
          recyclable materials.
        </p>
        <div className="mt-8 rounded-xl bg-white/10 p-6 backdrop-blur">
          <p className="text-sm text-green-100">Signed in as</p>
          <p className="text-lg font-medium">{user.email}</p>
          <p className="mt-2 text-sm text-green-100">
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
