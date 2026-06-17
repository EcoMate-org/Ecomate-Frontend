import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../../lib/auth/server";
import CheckoutView from "../../../../components/market_components/CheckoutView";

interface CheckoutPageProps {
  params: Promise<{ kind: string; id: string }>;
}

/**
 * /checkout/[kind]/[id] — demo checkout page.
 *
 * `kind` is "item" | "artwork" (validated client-side by CheckoutView,
 * which fetches /api/market/[kind]/[id]).
 */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const user = await getCurrentUser();
  const { kind, id } = await params;
  if (!user) redirect(`/signin?next=/checkout/${kind}/${id}`);

  const normalizedKind = kind.toLowerCase();
  if (normalizedKind !== "item" && normalizedKind !== "artwork") {
    redirect("/market");
  }

  return <CheckoutView kind={normalizedKind as "item" | "artwork"} id={id} />;
}
