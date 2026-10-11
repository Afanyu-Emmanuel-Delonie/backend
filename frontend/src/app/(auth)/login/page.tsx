"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { ApiError, backendUrl, login as apiLogin, saveSession } from "@/lib/auth-api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetDone = searchParams.get("reset") === "1";
  const oauthError = searchParams.get("error");

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

      {(serverError || oauthError) && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError || oauthError}</span>
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

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <a
        href={`${backendUrl()}/oauth2/authorization/google`}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.88c2.27-2.09 3.58-5.17 3.58-8.84z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.94-2.9l-3.88-3.01c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.1C3.26 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.28a12 12 0 0 0 0 10.8z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.28 6.6l4.01 3.1C6.23 6.86 8.88 4.75 12 4.75z" />
        </svg>
        Continue with Google
      </a>

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
