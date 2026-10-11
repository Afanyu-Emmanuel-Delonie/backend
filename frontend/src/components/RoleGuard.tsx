"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredUser } from "@/lib/auth-api";

const RESTRICTED_ROUTES = ["/finance", "/workers"];

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;
    if (user.role !== "FARM_OWNER" && RESTRICTED_ROUTES.includes(pathname)) {
      router.replace("/overview");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
