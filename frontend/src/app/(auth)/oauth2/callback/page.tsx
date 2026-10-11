"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { loginWithToken } from "@/lib/auth-api";

function OAuth2CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      router.replace("/login?error=Google sign-in did not return a token.");
      return;
    }
    loginWithToken(token)
      .then(() => router.replace("/overview"))
      .catch(() => {
        setError("Could not finish signing in. Please try again.");
        setTimeout(() => router.replace("/login"), 2000);
      });
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-gray-500">
      {error ? (
        <span className="text-rose-600">{error}</span>
      ) : (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-(--brand)" />
          <span>Finishing sign-in…</span>
        </>
      )}
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuth2CallbackContent />
    </Suspense>
  );
}
