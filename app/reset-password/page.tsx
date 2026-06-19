"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, CheckCircle2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    if (!token) {
      setServerError("Missing reset token. Please use the link from your email.");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2000);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  });

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600">
          This link is missing a reset token. Please use the link from your email,
          or request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-4 inline-block text-sm font-medium text-ecomate-600 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-ecomate-600" />
        <h1 className="text-xl font-bold text-gray-900">Password updated!</h1>
        <p className="mt-2 text-sm text-gray-500">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-center text-2xl font-bold gradient-text">Reset password</h1>
      <p className="mt-1 text-center text-sm text-gray-500">Choose a new password below.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ecomate-50 px-4 py-12">
      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ecomate-600">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            EcoMate <span className="text-ecomate-500">AI</span>
          </span>
        </Link>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
