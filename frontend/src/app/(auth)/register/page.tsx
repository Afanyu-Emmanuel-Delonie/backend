"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Building2, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { ApiError, register as apiRegister } from "@/lib/auth-api";

type Errors = Partial<
  Record<"fullName" | "farmName" | "email" | "password" | "confirmPassword" | "terms", string>
>;

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [farmName, setFarmName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!farmName.trim()) next.farmName = "Farm name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    if (!agreed) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setServerError("");
    setLoading(true);
    try {
      await apiRegister({ fullName, farmName, email, phone, password });
      router.push(`/otp?flow=signup&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      setServerError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <div className="mb-7">
        <h1 className="font-heading text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1.5 text-sm text-gray-500">Set up FarmIQ for your farm in a couple of minutes.</p>
      </div>

      {serverError && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
        <AuthField
          id="fullName" label="Full name" icon={User}
          value={fullName} onChange={setFullName}
          placeholder="Jane Mukamana" autoComplete="name"
          error={errors.fullName}
        />
        <AuthField
          id="farmName" label="Farm name" icon={Building2}
          value={farmName} onChange={setFarmName}
          placeholder="Greenfields Farm" autoComplete="organization"
          error={errors.farmName}
        />
        <AuthField
          id="email" label="Email" type="email" icon={Mail}
          value={email} onChange={setEmail}
          placeholder="you@farm.com" autoComplete="email"
          error={errors.email}
        />
        <AuthField
          id="phone" label="Phone number (optional)" type="tel" icon={Phone}
          value={phone} onChange={setPhone}
          placeholder="+250 788 100 200" autoComplete="tel"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            id="password" label="Password" type="password" icon={Lock}
            value={password} onChange={setPassword}
            placeholder="••••••••" autoComplete="new-password"
            error={errors.password}
          />
          <AuthField
            id="confirmPassword" label="Confirm password" type="password" icon={Lock}
            value={confirmPassword} onChange={setConfirmPassword}
            placeholder="••••••••" autoComplete="new-password"
            error={errors.confirmPassword}
          />
        </div>

        <div>
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 accent-(--brand)" />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>
          {errors.terms && <p className="mt-1 text-[11px] text-rose-500">{errors.terms}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline text-(--brand) hover:text-(--brand-hover)">
          Sign in
        </Link>
      </p>
    </>
  );
}
