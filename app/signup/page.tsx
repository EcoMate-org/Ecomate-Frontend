/*"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf } from "lucide-react";
import {
  userSignupSchema,
  ngoSignupSchema,
  companySignupSchema,
} from "../../lib/validations/auth";

type Role = "USER" | "NGO" | "COMPANY";

type SignupFormValues = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  registrationNumber?: string;
  companyAddress?: string;
  email: string;
  password: string;
};

const clientSchemas = {
  USER: userSignupSchema.omit({ role: true }),
  NGO: ngoSignupSchema.omit({ role: true }),
  COMPANY: companySignupSchema.omit({ role: true }),
} as const;

const roleTabs: { value: Role; label: string }[] = [
  { value: "USER", label: "Individual" },
  { value: "NGO", label: "NGO" },
  { value: "COMPANY", label: "Company" },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("USER");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(clientSchemas[role]) as Resolver<SignupFormValues>,
  });

  const switchRole = (next: Role) => {
    setRole(next);
    setServerError(null);
    reset();
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, role }),
    });
    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(json.redirectTo ?? "/dashboard/user");
    router.refresh();
  });

  const isOrg = role !== "USER";

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

        <h1 className="text-center text-2xl font-bold gradient-text">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Join the recycling marketplace
        </p>

        {/* Role tabs }
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg bg-ecomate-100 p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchRole(tab.value)}
              className={`rounded-md px-2 py-2 text-sm font-medium transition-all ${
                role === tab.value
                  ? "bg-white text-ecomate-700 shadow"
                  : "text-ecomate-700/70 hover:text-ecomate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {role === "USER" && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First Name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Field
                label="Last Name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
          )}

          {isOrg && (
            <>
              <Field
                label="Company Name"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
              <Field
                label="Registration Number"
                error={errors.registrationNumber?.message}
                {...register("registrationNumber")}
              />
              <Field
                label="Company Address"
                error={errors.companyAddress?.message}
                {...register("companyAddress")}
              />
            </>
          )}

          <Field
            label="Email Address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Field
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

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
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-ecomate-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const Field = function Field({
  label,
  error,
  type = "text",
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        {...props}
        className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};*/

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, Mail } from "lucide-react";
import {
  userSignupSchema,
  ngoSignupSchema,
  companySignupSchema,
} from "../../lib/validations/auth";

type Role = "USER" | "NGO" | "COMPANY";

type SignupFormValues = {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  registrationNumber?: string;
  companyAddress?: string;
  email: string;
  password: string;
};

const clientSchemas = {
  USER: userSignupSchema.omit({ role: true }),
  NGO: ngoSignupSchema.omit({ role: true }),
  COMPANY: companySignupSchema.omit({ role: true }),
} as const;

const roleTabs: { value: Role; label: string }[] = [
  { value: "USER", label: "Individual" },
  { value: "NGO", label: "NGO" },
  { value: "COMPANY", label: "Company" },
];

export default function SignupPage() {
  const [role, setRole] = useState<Role>("USER");
  const [serverError, setServerError] = useState<string | null>(null);
  // CHANGED: instead of redirecting on success, we now show a
  // "check your email" screen — registration no longer logs the user in
  // immediately (see app/api/auth/register/route.ts).
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(clientSchemas[role]) as Resolver<SignupFormValues>,
  });

  const switchRole = (next: Role) => {
    setRole(next);
    setServerError(null);
    reset();
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, role }),
    });
    const json = await res.json();

    if (!res.ok) {
      setServerError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    setRegisteredEmail(json.email ?? values.email);
  });

  const isOrg = role !== "USER";

  if (registeredEmail) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ecomate-50 px-4 py-12">
        <div className="glass w-full max-w-md rounded-2xl p-8 text-center shadow-xl">
          <Link href="/" className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ecomate-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              EcoMate <span className="text-ecomate-500">AI</span>
            </span>
          </Link>

          <Mail className="mx-auto mb-4 h-12 w-12 text-ecomate-600" />
          <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-2 text-sm text-gray-500">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-gray-700">{registeredEmail}</span>.
            Click the link to activate your account, then sign in.
          </p>

          <Link href="/signin" className="btn-primary mt-6 inline-block">
            Go to Sign In
          </Link>
        </div>
      </main>
    );
  }

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

        <h1 className="text-center text-2xl font-bold gradient-text">
          Create your account
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Join the recycling marketplace
        </p>

        {/* Role tabs */}
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg bg-ecomate-100 p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => switchRole(tab.value)}
              className={`rounded-md px-2 py-2 text-sm font-medium transition-all ${
                role === tab.value
                  ? "bg-white text-ecomate-700 shadow"
                  : "text-ecomate-700/70 hover:text-ecomate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {role === "USER" && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First Name"
                error={errors.firstName?.message}
                {...register("firstName")}
              />
              <Field
                label="Last Name"
                error={errors.lastName?.message}
                {...register("lastName")}
              />
            </div>
          )}

          {isOrg && (
            <>
              <Field
                label="Company Name"
                error={errors.companyName?.message}
                {...register("companyName")}
              />
              <Field
                label="Registration Number"
                error={errors.registrationNumber?.message}
                {...register("registrationNumber")}
              />
              <Field
                label="Company Address"
                error={errors.companyAddress?.message}
                {...register("companyAddress")}
              />
            </>
          )}

          <Field
            label="Email Address"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Field
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

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
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-ecomate-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

const Field = function Field({
  label,
  error,
  type = "text",
  ref,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  ref?: React.Ref<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        {...props}
        className="w-full rounded-lg border border-ecomate-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-ecomate-500 focus:ring-2 focus:ring-ecomate-500/30"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

