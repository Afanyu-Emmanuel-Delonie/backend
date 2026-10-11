"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useSidebar } from "@/lib/sidebar-store";
import { clearSession, getStoredUser, type UserResponse } from "@/lib/auth-api";
import { BrandMark } from "@/components/BrandMark";
import Link from "next/link";

const SECTION_TITLES: Record<string, string> = {
  "/overview":   "Overview",
  "/herd":       "Herd",
  "/production": "Milk production",
  "/health":     "Health records",
  "/finance":    "Finance",
  "/inventory":  "Inventory",
  "/workers":    "Workers",
  "/reports":    "Reports",
  "/profile":    "Profile & access",
  "/settings":   "Settings",
};

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Bessie #A12 flagged as sick",       time: "2m ago", unread: true  },
  { id: 2, text: "Milk production report ready",      time: "1h ago", unread: true  },
  { id: 3, text: "Treatment for Daisy #B04 due",      time: "3h ago", unread: false },
];

export function Topbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const section   = SECTION_TITLES[pathname] ?? "Overview";
  const { collapsed } = useSidebar();

  const [user, setUser] = useState<UserResponse | null>(null);
  useEffect(() => { setUser(getStoredUser()); }, []);

  const initials = user
    ? ((user.fullName.split(" ")[0]?.[0] ?? "") + (user.fullName.split(" ").at(-1)?.[0] ?? "")).toUpperCase()
    : "?";

  function handleLogout() { clearSession(); router.push("/login"); }

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  // close dropdowns when clicking outside
  useEffect(() => {
    function close() { setNotifOpen(false); setProfileOpen(false); }
    if (notifOpen || profileOpen) document.addEventListener("click", close, { once: true });
  }, [notifOpen, profileOpen]);

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:h-16 sm:px-8">

      {/* Left — mobile: logo, desktop: breadcrumb */}
      <Link href="/overview" className="flex items-center gap-2 sm:hidden">
        <BrandMark className="h-6 w-6 text-(--brand)" />
        <span className="font-heading text-base font-extrabold tracking-tight text-(--brand)">FarmIQ</span>
      </Link>
      <div className="hidden text-xs text-gray-400 sm:block">
        Workspace <span className="px-2 text-gray-300">/</span>
        <strong className="font-semibold text-gray-700">{section}</strong>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Search — desktop inline */}
        <label className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
          <input
            ref={searchRef}
            type="search"
            placeholder="Search herd, records…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-48 rounded-full border border-gray-200 bg-white pl-9 pr-4 text-xs text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:w-64 focus:[border-color:var(--brand-light)] focus:[box-shadow:0_0_0_2px_color-mix(in_srgb,var(--brand-light)_15%,transparent)]"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </label>

        {/* Search icon — mobile/tablet */}
        <button type="button" onClick={openSearch} aria-label="Search"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100 md:hidden">
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label="Notifications"
            onClick={() => { setNotifOpen((o) => !o); setProfileOpen(false); }}
            className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-gray-500 hover:bg-gray-100">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-orange-400" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 z-20 w-[calc(100vw-2rem)] max-w-xs rounded-xl border border-gray-100 bg-white shadow-lg sm:w-72">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-700">Notifications</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <ul>
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 text-xs transition-colors hover:bg-gray-50 ${n.unread ? "bg-emerald-50/60" : ""}`}>
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${n.unread ? "bg-(--brand)" : ""}`} />
                    <span className="flex-1 text-gray-700">{n.text}</span>
                    <span className="shrink-0 text-[10px] text-gray-400">{n.time}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 px-4 py-2">
                <button type="button" className="text-[11px] font-medium text-(--brand) hover:underline">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile avatar */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button type="button" aria-label="Account menu"
            onClick={() => { setProfileOpen((o) => !o); setNotifOpen(false); }}
            className="relative h-8 w-8 shrink-0 rounded-full p-[2px] transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--brand), var(--brand-light))" }}>
            <span className="grid h-full w-full place-items-center rounded-full bg-(--brand) text-[11px] font-bold text-white">
              {initials}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-gray-100 bg-white shadow-lg">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="truncate text-xs font-semibold text-gray-800">{user?.fullName ?? "—"}</p>
                <p className="truncate text-[11px] text-gray-400">{user?.farmName ?? "Farm"}</p>
              </div>
              <ul className="py-1">
                <li>
                  <button type="button" onClick={() => { setProfileOpen(false); router.push("/profile"); }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-600 hover:bg-gray-50">
                    Profile settings
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setProfileOpen(false); router.push("/settings"); }}
                    className="w-full px-4 py-2 text-left text-xs text-gray-600 hover:bg-gray-50">
                    Farm settings
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => { setProfileOpen(false); handleLogout(); }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-500 hover:bg-rose-50">
                    Log out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile full-width search overlay */}
      {searchOpen && (
        <div className="absolute inset-x-0 top-0 z-30 flex h-14 items-center gap-3 bg-white px-4 sm:h-16 md:hidden">
          <Search className="h-4 w-4 shrink-0 text-gray-300" />
          <input ref={searchRef} type="search" placeholder="Search herd, records…"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400" />
          <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  );
}
