"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LayoutGrid,
  LogOut,
  Milk,
  PawPrint,
  Users,
  Wallet,
  BarChart2,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useFarm } from "@/lib/farm-store";
import { useSidebar } from "@/lib/sidebar-store";
import { clearSession, getStoredUser, type UserRole } from "@/lib/auth-api";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "overview",    label: "Overview",        href: "/overview",    icon: LayoutGrid },
  { id: "herd",        label: "Herd",            href: "/herd",        icon: PawPrint   },
  { id: "production",  label: "Milk production", href: "/production",  icon: Milk       },
  { id: "health",      label: "Health records",  href: "/health",      icon: HeartPulse },
  { id: "finance",     label: "Finance",         href: "/finance",     icon: Wallet     },
  { id: "inventory",   label: "Inventory",       href: "/inventory",   icon: Boxes      },
  { id: "workers",     label: "Workers",         href: "/workers",     icon: Users      },
  { id: "reports",     label: "Reports",         href: "/reports",     icon: BarChart2  },
] as const;

const RESTRICTED = new Set(["finance", "workers"]);

function visibleNav(role: UserRole | null) {
  if (!role || role === "FARM_OWNER") return NAV_ITEMS;
  return NAV_ITEMS.filter((item) => !RESTRICTED.has(item.id));
}

// Show only the 5 most important items in the mobile bottom bar
const MOBILE_NAV_IDS = ["overview", "herd", "production", "health", "inventory"];

function userInitials(fullName: string) {
  const parts = fullName.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cattle } = useFarm();
  const { collapsed, toggle } = useSidebar();
  const needsCare = cattle.filter(
    (c) => c.healthStatus === "SICK" || c.healthStatus === "UNDER_TREATMENT"
  ).length;

  const [userName, setUserName] = useState("Farm Admin");
  const [farmName, setFarmName] = useState("Farm Owner");
  const [role, setRole] = useState<UserRole | null>(null);
  useEffect(() => {
    const u = getStoredUser();
    if (u) { setUserName(u.fullName); setFarmName(u.farmName); setRole(u.role); }
  }, []);

  const nav = visibleNav(role);
  const mobileNav = nav.filter((item) => MOBILE_NAV_IDS.includes(item.id));

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-(--brand) py-6 transition-all duration-200 sm:flex ${
          collapsed ? "w-[68px] items-center px-2" : "w-64 px-4"
        }`}
      >
        {/* Logo + collapse toggle */}
        <div className={`mb-8 flex w-full items-center ${collapsed ? "justify-center" : "justify-between px-1"}`}>
          <Link href="/overview" className="flex items-center gap-2">
            <BrandMark className="h-7 w-7 shrink-0 text-white" />
            {!collapsed && (
              <span className="font-heading text-lg font-extrabold tracking-tight text-white">FarmIQ</span>
            )}
          </Link>
          {!collapsed && (
            <button type="button" onClick={toggle} aria-label="Collapse sidebar"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button type="button" onClick={toggle} aria-label="Expand sidebar"
            className="mb-6 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Nav */}
        <nav className="grid w-full gap-0.5">
          {nav.map(({ id, label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={id} href={href} aria-current={isActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={`flex h-10 w-full items-center gap-3 rounded-lg text-[13px] font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : "px-3"
                }`}
                style={{
                  color: isActive ? "var(--nav-text-active)" : "var(--nav-text)",
                  backgroundColor: isActive ? "var(--nav-active-bg)" : undefined,
                }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
                {!collapsed && <span className="truncate">{label}</span>}
                {!collapsed && id === "health" && needsCare > 0 && (
                  <span className="ml-auto rounded-md bg-orange-400 px-1.5 py-0.5 text-[10px] font-bold text-white">{needsCare}</span>
                )}
                {collapsed && id === "health" && needsCare > 0 && (
                  <span className="absolute ml-4 -mt-4 h-2 w-2 rounded-full bg-orange-400 ring-2 ring-[var(--brand)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom user row */}
        <div className={`mt-auto w-full border-t border-white/10 pt-4 ${collapsed ? "flex flex-col items-center gap-1" : ""}`}>
          <div className="mb-3 border-t border-white/10" />
          {!collapsed ? (
            <div className="flex items-center gap-2.5 px-1">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white">
                {userInitials(userName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold text-white">{userName}</span>
                <span className="block truncate text-[11px] text-white/60">{farmName}</span>
              </span>
              <button type="button" title="Log out" onClick={handleLogout}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-rose-400">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" title="Log out" onClick={handleLogout}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold text-white">
              {userInitials(userName)}
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="fixed bottom-0 inset-x-0 z-20 flex h-16 items-center justify-around border-t border-gray-200 bg-white sm:hidden">
        {mobileNav.map(({ id, label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={id} href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                isActive ? "text-(--brand)" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
              <span className="truncate">{label.split(" ")[0]}</span>
              {id === "health" && needsCare > 0 && (
                <span className="absolute mt-0 ml-4 h-1.5 w-1.5 rounded-full bg-orange-400" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
