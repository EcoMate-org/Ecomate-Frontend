"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { MarketListing } from "../../lib/marketTypes";
import { MATERIAL_LABELS } from "../../lib/marketTypes";

interface CheckoutViewProps {
  kind: "item" | "artwork";
  id: string;
}

type CheckoutStage = "loading" | "summary" | "processing" | "success" | "error";

function formatPrice(price: string): string {
  return `₦${Number(price).toLocaleString()}`;
}

/**
 * Demo checkout flow:
 *  1. Loads the listing summary (price, title, image).
 *  2. Shows an order summary with a "Pay now" button.
 *  3. On click, shows a "Processing your payment…" progress animation
 *     (mirrors the FX Replay reference screenshot) for ~2.5s.
 *  4. Calls POST /api/checkout/[kind]/[id] to record the Order and flip
 *     Item.status / Artwork.isAvailable.
 *  5. Shows a success screen with a link back to the Marketplace.
 *
 * No real payment provider is used — this is a UI-only simulation that
 * triggers real database writes once "payment" completes.
 */
export default function CheckoutView({ kind, id }: CheckoutViewProps) {
  const router = useRouter();
  const [listing, setListing] = useState<MarketListing | null>(null);
  const [stage, setStage] = useState<CheckoutStage>("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Load listing summary
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/market/${kind}/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load listing"))))
      .then((json) => {
        if (!cancelled) {
          setListing(json.listing);
          setStage("summary");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load listing");
          setStage("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  // Drive the fake progress bar while "processing"
  useEffect(() => {
    if (stage !== "processing") return;

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 18 + 7, 100));
    }, 250);

    const completeTimer = setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);

      try {
        const res = await fetch(`/api/checkout/${kind}/${id}`, { method: "POST" });
        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.error ?? "Checkout failed");
        }
        setStage("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Checkout failed");
        setStage("error");
      }
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [stage, kind, id]);

  const materialLabel =
    kind === "artwork"
      ? MATERIAL_LABELS.ART
      : listing?.materialType
        ? MATERIAL_LABELS[listing.materialType]
        : null;

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/8 bg-[#0a1f12] px-4">
        <Link
          href="/market"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/12"
        >
          <ArrowLeft size={15} />
        </Link>
        <span className="text-sm font-semibold text-white">Checkout</span>
      </header>

      <div className="mx-auto max-w-md px-4 py-8">
        {stage === "loading" && (
          <div className="flex flex-col gap-3">
            <div className="h-40 animate-pulse rounded-2xl bg-white/4" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/4" />
          </div>
        )}

        {stage === "error" && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/8 p-6 text-center">
            <p className="text-sm font-semibold text-red-400">{error}</p>
            <Link
              href="/market"
              className="mt-4 inline-block rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/8"
            >
              Back to Marketplace
            </Link>
          </div>
        )}

        {(stage === "summary" || stage === "processing") && listing && (
          <>
            {/* Product summary */}
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="relative h-44 w-full bg-white/5">
                {listing.imageUrl ? (
                  <Image src={listing.imageUrl} alt={listing.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-white/30">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h1 className="text-base font-semibold text-white">{listing.title}</h1>
                <div className="mt-2 flex flex-col gap-1 text-xs text-white/55">
                  {materialLabel && <Row label="Material" value={materialLabel} />}
                  {listing.quantity !== null && (
                    <Row
                      label="Quantity"
                      value={kind === "artwork" ? `${listing.quantity}` : `${listing.quantity} kg`}
                    />
                  )}
                  {listing.location && <Row label="Location" value={listing.location} />}
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/4 p-4">
              <h2 className="text-sm font-semibold text-white">Order Summary</h2>
              <p className="mt-1 text-xs text-white/45">
                This is a demo checkout — no real payment is processed.
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
                <span className="text-sm text-white/60">Total</span>
                <span className="text-lg font-bold text-ecomate-400">
                  {listing.price ? formatPrice(listing.price) : "—"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStage("processing")}
                disabled={stage === "processing"}
                className="mt-4 w-full rounded-lg bg-ecomate-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-ecomate-700 active:scale-95 disabled:opacity-60"
              >
                {stage === "processing" ? "Processing…" : "Pay now"}
              </button>
            </div>
          </>
        )}

        {/* Processing overlay */}
        {stage === "processing" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d2818] p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-gradient-to-br from-ecomate-400 to-ecomate-700" />
              <h2 className="text-lg font-semibold text-white">Processing your payment…</h2>
              <p className="mt-1 text-sm text-white/45">
                {progress < 100 ? "Checking details…" : "Finalizing order…"}
              </p>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-ecomate-500 to-ecomate-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/40">{Math.round(progress)}%</p>
              <p className="mt-4 text-xs text-white/35">Please don&apos;t close this window.</p>
            </div>
          </div>
        )}

        {/* Success */}
        {stage === "success" && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-ecomate-500/20 bg-ecomate-500/8 p-8 text-center">
            <CheckCircle2 size={48} className="text-ecomate-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">Order placed successfully!</h2>
              <p className="mt-1 text-sm text-white/55">
                Your order has been recorded and the seller has been notified.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push("/market")}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/8"
              >
                Back to Marketplace
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/user")}
                className="rounded-lg bg-ecomate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ecomate-700"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}:</span>
      <span className="text-white/75">{value}</span>
    </div>
  );
}
