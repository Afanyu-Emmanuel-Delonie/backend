"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth-api";

/** Redirects to /login when there's no stored session; renders nothing until that check completes. */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;
  return <>{children}</>;
}
