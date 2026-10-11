"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { ApiError, forgotPassword, resetPassword } from "@/lib/auth-api";

function RequestStep({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      router.push(`/otp?flow=reset&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </Link>

      <div className="mb-7">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Reset your password</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Enter the email linked to your account and we&apos;ll send you a verification code.
        </p>
      </div>

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
          error={error}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Sending code…" : "Send code"}
        </button>
      </form>
    </>
  );
}

function NewPasswordStep({ email, resetToken }: { email: string; resetToken: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setLoading(true);
    try {
      await resetPassword({ resetToken, newPassword: password });
      router.push("/login?reset=1");
    } catch (err) {
      setLoading(false);
      setErrors({
        password: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Set a new password</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          {email ? (
            <>
              For <span className="font-medium text-gray-700">{email}</span>.
            </>
          ) : (
            "Choose a new password for your account."
          )}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <AuthField
          id="password"
          label="New password"
          type="password"
          icon={Lock}
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password}
        />
        <AuthField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          icon={Lock}
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step");
  const email = searchParams.get("email") ?? "";
  const resetToken = searchParams.get("resetToken") ?? "";

  return step === "new" ? (
    <NewPasswordStep email={email} resetToken={resetToken} />
  ) : (
    <RequestStep initialEmail={email} />
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
