"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
import { loginSchema, type LoginInput } from "../../lib/validations/auth";

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? "Unable to sign in. Please try again.");
      return;
    }

    router.push(next || json.redirectTo || "/dashboard/user");
    router.refresh();
  });

  return (
    <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl">
      <Link href="/" className="mb-6 flex items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ecomate-600">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">
          EcoMate <span className="text-ecomate-500">AI</span>
        </span>
      </Link>

      <h1 className="text-center text-2xl font-bold gradient-text">
        Welcome back
      </h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        Sign in to your account
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
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
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-ecomate-600 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function SigninPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-ecomate-50 px-4 py-12">
      <Suspense fallback={null}>
        <SigninForm />
      </Suspense>
    </main>
  );
}
