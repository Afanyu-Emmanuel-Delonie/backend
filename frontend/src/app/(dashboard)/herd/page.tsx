"use client";

import { useState, useMemo, Fragment, useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown, PawPrint, Plus, Search, TrendingUp, X } from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import {
  AGE_STAGE_ORDER,
  AgeStage,
  HealthStatus,
  ageLabel,
  ageStage,
  ageStageTone,
  cowColor,
} from "@/lib/status";
import type { Cattle } from "@/lib/seed-data";
import { formatMoney } from "@/lib/currency";
import { BrandMark } from "@/components/BrandMark";

const HEALTH_FILTERS: { label: string; value: HealthStatus | "ALL" }[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Healthy", value: "HEALTHY" },
  { label: "Recovered", value: "RECOVERED" },
  { label: "In treatment", value: "UNDER_TREATMENT" },
  { label: "Sick", value: "SICK" },
  { label: "Deceased", value: "DECEASED" },
];

const STATUS_LABEL: Record<HealthStatus, string> = {
  HEALTHY: "Healthy",
  RECOVERED: "Recovered",
  UNDER_TREATMENT: "In treatment",
  SICK: "Sick",
  DECEASED: "Deceased",
};

const STATUS_DOT: Record<HealthStatus, string> = {
  HEALTHY: "bg-(--brand-light)",
  RECOVERED: "bg-(--brand-light)",
  UNDER_TREATMENT: "bg-amber-500",
  SICK: "bg-red-500",
  DECEASED: "bg-gray-400",
};

const STATUS_TEXT: Record<HealthStatus, string> = {
  HEALTHY: "text-(--brand)",
  RECOVERED: "text-(--brand)",
  UNDER_TREATMENT: "text-amber-700",
  SICK: "text-red-600",
  DECEASED: "text-gray-500",
};

const PAGE_SIZE = 10;
const KNOWN_BREEDS = ["Holstein Friesian", "Jersey", "Guernsey", "Ayrshire", "Brown Swiss", "Friesian"];
const today = () => new Date().toLocaleDateString("en-CA");

export default function HerdPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".gs-header", { y: -16, opacity: 0, duration: 0.45 })
        .from(".gs-card", { y: 24, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.2")
        .from(".gs-section", { y: 20, opacity: 0, duration: 0.4, stagger: 0.12 }, "-=0.2");
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const { cattle, records, addCattle } = useFarm();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<AgeStage | "ALL">("ALL");
  const [healthFilter, setHealthFilter] = useState<HealthStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const milkingIds = useMemo(
    () => new Set(records.map((r) => r.cattleId)),
    [records]
  );

  const trendByCattle = useMemo(() => {
    const map = new Map<number, { date: string; total: number }[]>();
    const dates = Array.from(
      new Set(records.map((r) => r.recordDate))
    ).sort();
    for (const id of milkingIds) {
      map.set(
        id,
        dates.map((date) => ({
          date: date.slice(5),
          total: records
            .filter((r) => r.cattleId === id && r.recordDate === date)
            .reduce((s, r) => s + r.quantityLiters, 0),
        }))
      );
    }
    return map;
  }, [records, milkingIds]);

  // KPIs
  const total = cattle.length;
  const active = cattle.filter((c) => c.healthStatus !== "DECEASED");
  const needsCare = cattle.filter((c) => c.healthStatus === "SICK" || c.healthStatus === "UNDER_TREATMENT").length;
  const herdValue = active.reduce((sum, c) => sum + c.estimatedValue, 0);

  const filtered = cattle.filter((c) => {
    if (stageFilter !== "ALL" && ageStage(c.dateOfBirth) !== stageFilter) return false;
    if (healthFilter !== "ALL" && c.healthStatus !== healthFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.tagNumber.toLowerCase().includes(q) && !c.breed.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filterKey = `${search}|${stageFilter}|${healthFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const pageNumbers: number[] = [];
  for (let p = Math.max(1, safePage - 2); p <= Math.min(totalPages, safePage + 2); p++) pageNumbers.push(p);

  const hasFilters = search || stageFilter !== "ALL" || healthFilter !== "ALL";

  return (
    <div ref={pageRef}>
      <section className="gs-header mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Your herd</h1>
          <p className="mt-1.5 text-sm text-gray-500">{total} animals registered on Greenfields Farm.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover)"
        >
          <Plus className="h-4 w-4" /> Add animal
        </button>
      </section>

      {/* KPI cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-4">
          <BrandMark className="pointer-events-none absolute -right-4 -bottom-5 h-24 w-24 text-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Total</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><PawPrint className="h-4 w-4" /></span>
          </div>
          <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{total}</strong>
          <p className="relative mt-2 text-xs text-white/70">Animals registered</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Active</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{active.length}</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Needs care</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{needsCare}</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Herd value</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(herdValue)}</p>
        </article>
      </section>

      {/* Filters */}
      <section className="gs-section mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tag or breed…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as AgeStage | "ALL")}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
        >
          <option value="ALL">All stages</option>
          {AGE_STAGE_ORDER.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value as HealthStatus | "ALL")}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
        >
          {HEALTH_FILTERS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setStageFilter("ALL"); setHealthFilter("ALL"); setSearch(""); }}
            className="h-9 rounded-xl px-3 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </section>

      {/* Table */}
      <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="h-11 px-5 text-[10px] font-semibold tracking-wide text-gray-400">ANIMAL</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">AGE</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STAGE</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STATUS</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">VALUE</th>
                <th className="h-11 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-sm text-gray-400">
                    {cattle.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <PawPrint className="h-6 w-6 text-gray-300" />
                        <p>No animals registered yet.</p>
                        <button
                          type="button"
                          onClick={() => setAddOpen(true)}
                          className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)"
                        >
                          Add your first animal
                        </button>
                      </div>
                    ) : (
                      "No animals match your filters."
                    )}
                  </td>
                </tr>
              )}
              {paginated.map((c) => {
                const stage = ageStage(c.dateOfBirth);
                return (
                  <Fragment key={c.id}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="h-16 px-5">
                      <div className="flex items-center gap-3">
                        {milkingIds.has(c.id) && (
                          <button
                            type="button"
                            onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} />
                          </button>
                        )}
                        {!milkingIds.has(c.id) && <span className="w-6 shrink-0" />}
                        <Link href={`/herd/${c.id}`} className="flex items-center gap-3">
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${cowColor(c.id)}`}>
                            <span className="text-xs font-bold">{c.tagNumber.slice(-2)}</span>
                          </span>
                          <div className="min-w-0">
                            <b className="block truncate text-xs font-semibold text-gray-800 hover:underline">{c.tagNumber}</b>
                            <small className="block truncate text-[11px] text-gray-400">{c.breed}</small>
                          </div>
                        </Link>
                      </div>
                    </td>
                    <td className="h-16 px-3 text-xs text-gray-500">{ageLabel(c.dateOfBirth)}</td>
                    <td className="h-16 px-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${ageStageTone[stage]}`}>
                        {stage}
                      </span>
                    </td>
                    <td className="h-16 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[c.healthStatus]}`} />
                        <span className={STATUS_TEXT[c.healthStatus]}>{STATUS_LABEL[c.healthStatus]}</span>
                      </span>
                    </td>
                    <td className="h-16 px-3 text-xs font-semibold text-(--brand)">
                      {c.estimatedValue > 0 ? formatMoney(c.estimatedValue) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="h-16 px-5 text-right">
                      <Link
                        href={`/herd/${c.id}`}
                        className="ml-auto inline-flex h-8 items-center rounded-lg px-3 text-xs font-semibold text-(--brand) transition-colors hover:bg-green-50"
                      >
                        View
                      </Link>
                    </td>
                    </tr>
                    {expandedId === c.id && milkingIds.has(c.id) && (
                    <tr key={`${c.id}-trend`} className="border-t border-gray-100 bg-gray-50/40">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-3.5 w-3.5 text-sky-500" />
                          <span className="text-xs font-semibold text-gray-700">Milk production trend — last {trendByCattle.get(c.id)?.length ?? 0} days</span>
                        </div>
                        <ResponsiveContainer width="100%" height={80}>
                          <AreaChart data={trendByCattle.get(c.id)} margin={{ top: 2, right: 4, left: -32, bottom: 0 }}>
                            <defs>
                              <linearGradient id={`g${c.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Tooltip
                              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "none" }}
                              formatter={(v) => [`${Number(v).toFixed(1)} L`, "Total"]}
                            />
                            <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={1.5} fill={`url(#g${c.id})`} dot={{ r: 2.5, fill: "#0ea5e9", strokeWidth: 0 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </td>
                    </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-400">
            {filtered.length === 0 ? "No animals" : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Previous page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {pageNumbers[0] > 1 && <span className="px-1 text-xs text-gray-300">…</span>}
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${
                  p === safePage ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {p}
              </button>
            ))}
            {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-1 text-xs text-gray-300">…</span>}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Next page"
              className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {addOpen && <AddAnimalPanel onClose={() => setAddOpen(false)} onAdd={addCattle} />}
    </div>
  );
}

function AddAnimalPanel({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: Omit<Cattle, "id">) => Promise<Cattle>;
}) {
  const [tagNumber, setTagNumber] = useState("");
  const [breed, setBreed] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(today());
  const [healthStatus, setHealthStatus] = useState<HealthStatus>("HEALTHY");
  const [acquisition, setAcquisition] = useState<"BORN" | "PURCHASED">("BORN");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [estimatedValue, setEstimatedValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tagNumber.trim()) return setError("Enter a tag number.");
    if (!breed.trim()) return setError("Enter a breed.");
    if (!dateOfBirth) return setError("Pick a date of birth.");
    const value = parseFloat(estimatedValue);
    if (isNaN(value) || value <= 0) return setError("Enter a valid estimated value.");

    let price: number | undefined;
    if (acquisition === "PURCHASED") {
      price = parseFloat(purchasePrice);
      if (isNaN(price) || price <= 0) return setError("Enter a valid purchase price.");
    }

    setError("");
    setSaving(true);
    try {
      await onAdd({
        tagNumber: tagNumber.trim(),
        breed: breed.trim(),
        dateOfBirth,
        healthStatus,
        estimatedValue: value,
        ...(acquisition === "PURCHASED" ? { purchaseDate, purchasePrice: price } : {}),
      });
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not save the animal. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Add animal</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="Close">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Tag number</label>
            <input
              type="text"
              placeholder="e.g. VQ-1059"
              value={tagNumber}
              onChange={(e) => setTagNumber(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Breed</label>
            <input
              type="text"
              list="breed-options"
              placeholder="e.g. Jersey"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            />
            <datalist id="breed-options">
              {KNOWN_BREEDS.map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Date of birth</label>
            <input
              type="date"
              value={dateOfBirth}
              max={today()}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Health status</label>
            <select
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value as HealthStatus)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            >
              {(["HEALTHY", "SICK", "UNDER_TREATMENT", "RECOVERED"] as const).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Acquisition</label>
            <div className="grid grid-cols-2 gap-2">
              {(["BORN", "PURCHASED"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAcquisition(a)}
                  className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                    acquisition === a ? "border-(--brand) bg-green-50 text-(--brand)" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {a === "BORN" ? "Born on farm" : "Purchased"}
                </button>
              ))}
            </div>
          </div>

          {acquisition === "PURCHASED" && (
            <>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Purchase date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  max={today()}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Purchase price (RWF)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 450000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>
            </>
          )}

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Estimated value (RWF)</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 600000"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            />
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}

          <div className="mt-auto grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save animal"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
