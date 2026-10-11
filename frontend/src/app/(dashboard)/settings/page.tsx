"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  Database,
  Download,
  Loader2,
  MapPin,
  Moon,
  Palette,
  Phone,
  Sun,
  Trash2,
} from "lucide-react";
import { getStoredUser, updateProfile, updateStoredUser } from "@/lib/auth-api";

type Section = "farm" | "notifications" | "appearance" | "data";

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "farm", label: "Farm info", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "data", label: "Data & export", icon: Database },
];

const CURRENCIES = ["RWF", "USD", "EUR", "KES", "UGX", "TZS"];
const TIMEZONES = [
  "Africa/Kigali",
  "Africa/Nairobi",
  "Africa/Kampala",
  "Africa/Dar_es_Salaam",
  "UTC",
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        checked ? "bg-(--brand)" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<Section>("farm");

  // Farm info — seeded from stored user
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmPhone, setFarmPhone] = useState("");
  const [currency, setCurrency] = useState("RWF");
  const [timezone, setTimezone] = useState("Africa/Kigali");
  const [farmLoading, setFarmLoading] = useState(false);
  const [farmError, setFarmError] = useState("");
  const [farmSaved, setFarmSaved] = useState(false);

  useEffect(() => {
    const u = getStoredUser();
    if (!u) return;
    setFarmName(u.farmName);
    setFarmPhone(u.phone ?? "");
  }, []);

  // Notifications
  const [notifSick, setNotifSick] = useState(true);
  const [notifProduction, setNotifProduction] = useState(true);
  const [notifInventory, setNotifInventory] = useState(false);
  const [notifPayroll, setNotifPayroll] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSaved, setNotifSaved] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [appearSaved, setAppearSaved] = useState(false);

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleSaveFarm(e: React.FormEvent) {
    e.preventDefault();
    if (!farmName.trim()) return setFarmError("Farm name is required.");
    setFarmError("");
    setFarmLoading(true);
    try {
      const u = getStoredUser();
      const updated = await updateProfile({ fullName: u?.fullName ?? "", farmName: farmName.trim(), phone: farmPhone.trim() });
      updateStoredUser(updated);
      setFarmSaved(true);
      setTimeout(() => setFarmSaved(false), 2500);
    } catch (err: unknown) {
      setFarmError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setFarmLoading(false);
    }
  }

  function save(setter: (v: boolean) => void) {
    setter(true);
    setTimeout(() => setter(false), 2500);
  }

  return (
    <>
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="mt-1.5 text-sm text-gray-500">Manage your farm configuration and preferences.</p>
      </section>

      <div className="flex gap-4 lg:items-start">

        {/* Sidebar nav */}
        <nav className="hidden w-44 shrink-0 flex-col gap-0.5 lg:flex">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                active === id
                  ? "bg-(--brand) text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile tab strip */}
        <div className="mb-4 flex w-full gap-1 overflow-x-auto lg:hidden">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                active === id
                  ? "bg-(--brand) text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">

          {/* Farm info */}
          {active === "farm" && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-(--brand-light)" />
                <h2 className="text-sm font-semibold text-gray-900">Farm information</h2>
              </div>
              <form onSubmit={handleSaveFarm} className="grid gap-4">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Farm name</label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Location</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Contact phone</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      value={farmPhone}
                      onChange={(e) => setFarmPhone(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                    >
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <label className="text-xs font-medium text-gray-600">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                    >
                      {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {farmError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{farmError}</p>}
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={farmLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
                    {farmLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : farmSaved ? <Check className="h-4 w-4" /> : null}
                    {farmLoading ? "Saving…" : farmSaved ? "Saved" : "Save changes"}
                  </button>
                  {farmSaved && <span className="text-xs text-gray-400">Farm info updated</span>}
                </div>
              </form>
            </section>
          )}

          {/* Notifications */}
          {active === "notifications" && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Bell className="h-4 w-4 text-(--brand-light)" />
                <h2 className="text-sm font-semibold text-gray-900">Notification preferences</h2>
              </div>
              <div className="grid gap-5">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">In-app alerts</p>
                  <div className="grid gap-3">
                    {[
                      { label: "Animal flagged sick or under treatment", sub: "Triggered when health status changes", value: notifSick, set: setNotifSick },
                      { label: "Daily milk production summary", sub: "End-of-day production totals", value: notifProduction, set: setNotifProduction },
                      { label: "Low inventory alerts", sub: "When stock falls below reorder level", value: notifInventory, set: setNotifInventory },
                      { label: "Payroll reminders", sub: "Monthly salary due notifications", value: notifPayroll, set: setNotifPayroll },
                    ].map(({ label, sub, value, set }) => (
                      <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-3">
                        <div>
                          <p className="text-xs font-medium text-gray-800">{label}</p>
                          <p className="text-[11px] text-gray-400">{sub}</p>
                        </div>
                        <Toggle checked={value} onChange={set} />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Delivery</p>
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 p-3">
                    <div>
                      <p className="text-xs font-medium text-gray-800">Email notifications</p>
                      <p className="text-[11px] text-gray-400">Send alerts to your registered email</p>
                    </div>
                    <Toggle checked={notifEmail} onChange={setNotifEmail} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => save(setNotifSaved)}
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover)"
                >
                  {notifSaved ? <><Check className="h-4 w-4" /> Saved</> : "Save preferences"}
                </button>
              </div>
            </section>
          )}

          {/* Appearance */}
          {active === "appearance" && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6">
              <div className="mb-5 flex items-center gap-2">
                <Palette className="h-4 w-4 text-(--brand-light)" />
                <h2 className="text-sm font-semibold text-gray-900">Appearance</h2>
              </div>
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <p className="text-xs font-medium text-gray-600">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: "light", label: "Light", icon: Sun },
                      { value: "dark", label: "Dark", icon: Moon },
                      { value: "system", label: "System", icon: Palette },
                    ] as const).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors ${
                          theme === value
                            ? "border-(--brand) bg-green-50 text-(--brand)"
                            : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="text-xs font-medium text-gray-600">Density</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "comfortable", label: "Comfortable", sub: "More spacing, easier to scan" },
                      { value: "compact", label: "Compact", sub: "Tighter layout, more data visible" },
                    ] as const).map(({ value, label, sub }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setDensity(value)}
                        className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-colors ${
                          density === value
                            ? "border-(--brand) bg-green-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span className={`text-xs font-semibold ${density === value ? "text-(--brand)" : "text-gray-700"}`}>{label}</span>
                        <span className="text-[11px] text-gray-400">{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => save(setAppearSaved)}
                  className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover)"
                >
                  {appearSaved ? <><Check className="h-4 w-4" /> Saved</> : "Apply"}
                </button>
              </div>
            </section>
          )}

          {/* Data & export */}
          {active === "data" && (
            <div className="grid gap-4">
              <section className="rounded-2xl border border-gray-100 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Download className="h-4 w-4 text-(--brand-light)" />
                  <h2 className="text-sm font-semibold text-gray-900">Export data</h2>
                </div>
                <p className="mb-4 text-xs text-gray-500">Download your farm data as CSV files for use in spreadsheets or external tools.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Herd roster", sub: "All cattle records" },
                    { label: "Milk production", sub: "All milking shift records" },
                    { label: "Health records", sub: "Complaints & treatments" },
                    { label: "Finance summary", sub: "Asset values & revenue" },
                    { label: "Inventory", sub: "Stock & equipment list" },
                    { label: "Workers", sub: "Staff & payroll data" },
                  ].map(({ label, sub }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left transition-colors hover:border-(--brand-light) hover:bg-green-50"
                    >
                      <span>
                        <span className="block text-xs font-semibold text-gray-800">{label}</span>
                        <span className="block text-[11px] text-gray-400">{sub}</span>
                      </span>
                      <Download className="h-4 w-4 shrink-0 text-gray-300" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Danger zone */}
              <section className="rounded-2xl border border-rose-100 bg-white p-6">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-rose-600">Danger zone</h2>
                </div>
                <div className="grid gap-4">
                  <div className="flex items-start justify-between gap-4 rounded-xl border border-rose-100 p-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Reset all sample data</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">Clears all records and restores the original seed data. Cannot be undone.</p>
                    </div>
                    <button
                      type="button"
                      className="shrink-0 inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>

                  <div className="rounded-xl border border-rose-100 p-4">
                    <p className="text-xs font-semibold text-gray-800">Delete farm account</p>
                    <p className="mt-0.5 text-[11px] text-gray-400 mb-3">Permanently deletes all data. Type <strong>DELETE</strong> to confirm.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        className="h-9 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50"
                      />
                      <button
                        type="button"
                        disabled={deleteConfirm !== "DELETE"}
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
