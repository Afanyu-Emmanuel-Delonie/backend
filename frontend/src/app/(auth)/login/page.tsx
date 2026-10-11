"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { ApiError, login as apiLogin, saveSession } from "@/lib/auth-api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetDone = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    setLoading(true);
    try {
      const result = await apiLogin({ email, password });
      if (result.token && result.user) saveSession(result.token, result.user);
      router.push("/overview");
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError && err.status === 403) {
        router.push(`/otp?flow=signup&email=${encodeURIComponent(email)}`);
        return;
      }
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mt-1.5 text-sm text-gray-500">Welcome back. Enter your details to continue.</p>
      </div>

      {resetDone && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-100 bg-green-50 p-3 text-xs text-(--brand)">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Password updated. Sign in with your new password.</span>
        </div>
      )}

      {serverError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <AuthField
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          placeholder="you@farm.com"
          autoComplete="email"
          error={errors.email}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password}
        />

        <div className="flex items-center justify-end">
          <Link href="/reset-password" className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold underline text-(--brand) hover:text-(--brand-hover)">
          Create one
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
