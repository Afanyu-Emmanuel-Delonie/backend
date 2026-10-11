"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, RotateCcw, ShieldCheck } from "lucide-react";
import { OtpInput } from "@/components/auth/OtpInput";
import { ApiError, FLOW_TO_PURPOSE, resendOtp, saveSession, verifyOtp } from "@/lib/auth-api";

const COPY: Record<string, { title: string; subtitle: string; back: string; backLabel: string }> = {
  signup: {
    title: "Verify your email",
    subtitle: "We sent a 6-digit code to",
    back: "/register",
    backLabel: "Back to sign up",
  },
  login: {
    title: "Two-factor verification",
    subtitle: "We sent a 6-digit code to",
    back: "/login",
    backLabel: "Back to sign in",
  },
  reset: {
    title: "Verify your identity",
    subtitle: "We sent a 6-digit code to",
    back: "/reset-password",
    backLabel: "Back",
  },
};

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user.slice(0, 1)}${"*".repeat(Math.max(user.length - 1, 3))}@${domain}`;
}

function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow") ?? "login";
  const email = searchParams.get("email") ?? "";
  const copy = COPY[flow] ?? COPY.login;

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const purpose = FLOW_TO_PURPOSE[flow] ?? FLOW_TO_PURPOSE.login;

  async function handleResend() {
    if (cooldown > 0) return;
    setDigits(Array(6).fill(""));
    setError("");
    try {
      await resendOtp({ email, purpose });
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resend the code. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp({ email, code, purpose });
      if (result.token && result.user) {
        saveSession(result.token, result.user);
      }
      if (flow === "signup") router.push("/overview");
      else if (flow === "reset") {
        router.push(
          `/reset-password?step=new&email=${encodeURIComponent(email)}&resetToken=${encodeURIComponent(result.resetToken ?? "")}`
        );
      } else router.push("/overview");
    } catch (err) {
      setLoading(false);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <Link
        href={copy.back}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {copy.backLabel}
      </Link>

      <div className="mb-7">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-(--brand)">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h1 className="font-heading text-2xl font-semibold text-gray-900">{copy.title}</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          {copy.subtitle} {email ? <span className="font-medium text-gray-700">{maskEmail(email)}</span> : "your email"}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5" noValidate>
        <OtpInput
          value={digits}
          onChange={(next) => {
            setDigits(next);
            if (error) setError("");
          }}
          error={error}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Verifying…" : "Verify code"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-(--brand) hover:text-(--brand-hover) disabled:cursor-not-allowed disabled:text-gray-400"
      >
        <RotateCcw className="h-3 w-3" />
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={null}>
      <OtpForm />
    </Suspense>
  );
}
