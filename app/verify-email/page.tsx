"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Leaf } from "lucide-react";

type VerifyState = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    let cancelled = false;

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          setErrorMessage(json.error ?? "Verification failed.");
          return;
        }
        setState("success");
      })
      .catch(() => {
        if (!cancelled) {
          setState("error");
          setErrorMessage("Something went wrong. Please try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8 text-center shadow-xl">
      <Link href="/" className="mb-6 flex items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ecomate-600">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">
          EcoMate <span className="text-ecomate-500">AI</span>
        </span>
      </Link>

      {state === "loading" && (
        <p className="text-sm text-gray-500">Verifying your email…</p>
      )}

      {state === "success" && (
        <>
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-ecomate-600" />
          <h1 className="text-xl font-bold text-gray-900">Email verified!</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your account is now active. You can sign in below.
          </p>
          <Link href="/signin" className="btn-primary mt-6 inline-block">
            Sign In
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-xl font-bold text-gray-900">Verification failed</h1>
          <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
          <Link
            href="/signin"
            className="mt-6 inline-block text-sm font-medium text-ecomate-600 hover:underline"
          >
            Back to Sign In
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ecomate-50 px-4 py-12">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
