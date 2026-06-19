"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Mail } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  });

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

        {submitted ? (
          <div className="text-center">
            <Mail className="mx-auto mb-4 h-12 w-12 text-ecomate-600" />
            <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              If an account exists with that email, we&apos;ve sent a link to reset
              your password. It expires in 1 hour.
            </p>
            <Link
              href="/signin"
              className="mt-6 inline-block text-sm font-medium text-ecomate-600 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-bold gradient-text">
              Forgot password?
            </h1>
            <p className="mt-1 text-center text-sm text-gray-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {serverError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Remembered your password?{" "}
              <Link href="/signin" className="font-medium text-ecomate-600 hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
