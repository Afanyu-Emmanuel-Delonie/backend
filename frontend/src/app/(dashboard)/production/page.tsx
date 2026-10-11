"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import gsap from "gsap";
import Link from "next/link";
import { ChevronDown, Droplets, Moon, PawPrint, Plus, Search, Sun, X } from "lucide-react";
import { Shift } from "@/lib/seed-data";
import { useFarm } from "@/lib/farm-store";
import { cowColor } from "@/lib/status";
import { BrandMark } from "@/components/BrandMark";

const fmt = new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" });
const today = () => new Date().toLocaleDateString("en-CA");

export default function ProductionPage() {
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

  const { cattle: allCattle, records: allRecords, addMilkRecord } = useFarm();
  const cattle = allCattle.filter((c) => c.healthStatus !== "DECEASED" && c.healthStatus !== "SICK");

  const [search, setSearch] = useState("");
  const [shiftFilter, setShiftFilter] = useState<Shift | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // form state
  const [fCow, setFCow] = useState(String(cattle[0]?.id ?? ""));
  const [fDate, setFDate] = useState(today());
  const [fShift, setFShift] = useState<Shift>("MORNING");
  const [fQty, setFQty] = useState("");
  const [fErr, setFErr] = useState("");
  const [fSaving, setFSaving] = useState(false);
  const [cowSearch, setCowSearch] = useState("");
  const [cowOpen, setCowOpen] = useState(false);
  const cowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (cowRef.current && !cowRef.current.contains(e.target as Node)) setCowOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCattle = cattle.filter(
    (c) =>
      c.tagNumber.toLowerCase().includes(cowSearch.toLowerCase()) ||
      c.breed.toLowerCase().includes(cowSearch.toLowerCase())
  );
  const selectedCow = cattle.find((c) => c.id === Number(fCow));

  const filtered = useMemo(() => {
    return allRecords
      .filter((r) => {
        if (shiftFilter !== "ALL" && r.shift !== shiftFilter) return false;
        if (dateFilter && r.recordDate !== dateFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          const breed = allCattle.find((c) => c.id === r.cattleId)?.breed ?? "";
          if (!r.cattleTagNumber.toLowerCase().includes(q) && !breed.toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.recordDate.localeCompare(a.recordDate) || a.shift.localeCompare(b.shift));
  }, [allRecords, shiftFilter, dateFilter, search, allCattle]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // KPIs
  const todayTotal = useMemo(
    () => allRecords.filter((r) => r.recordDate === today()).reduce((s, r) => s + r.quantityLiters, 0),
    [allRecords]
  );
  const avgPerShift = allRecords.length
    ? allRecords.reduce((s, r) => s + r.quantityLiters, 0) / allRecords.length
    : 0;
  const topCow = useMemo(() => {
    const totals = new Map<number, number>();
    for (const r of allRecords) totals.set(r.cattleId, (totals.get(r.cattleId) ?? 0) + r.quantityLiters);
    const top = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? allCattle.find((c) => c.id === top[0])?.tagNumber ?? "—" : "—";
  }, [allRecords, allCattle]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(fQty);
    if (!fCow) return setFErr("Select an animal.");
    if (!fDate) return setFErr("Pick a date.");
    if (isNaN(qty) || qty <= 0) return setFErr("Enter a valid quantity.");
    setFErr("");
    setFSaving(true);
    try {
      await addMilkRecord({
        cattleId: Number(fCow),
        recordDate: fDate,
        shift: fShift,
        quantityLiters: qty,
      });
      setFQty("");
      setOpen(false);
    } catch (err) {
      setFErr(err instanceof Error ? err.message : "Could not save the record. Please try again.");
    } finally {
      setFSaving(false);
    }
  }

  const hasFilters = search || shiftFilter !== "ALL" || dateFilter;

  return (
    <div ref={pageRef}>
      <section className="gs-header mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Milk production</h1>
          <p className="mt-1.5 text-sm text-gray-500">{allRecords.length} recorded milking shifts.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover)"
        >
          <Plus className="h-4 w-4" /> Add record
        </button>
      </section>

      {/* KPI cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-4">
          <BrandMark className="pointer-events-none absolute -right-4 -bottom-5 h-24 w-24 text-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Total records</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><Droplets className="h-4 w-4" /></span>
          </div>
          <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{allRecords.length}</strong>
          <p className="relative mt-2 text-xs text-white/70">Recorded milking shifts</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Today&apos;s yield</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {todayTotal.toLocaleString("en-ZA", { maximumFractionDigits: 1 })}
            <small className="ml-1 text-xs font-medium text-gray-400">L</small>
          </p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Avg per shift</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {avgPerShift.toLocaleString("en-ZA", { maximumFractionDigits: 1 })}
            <small className="ml-1 text-xs font-medium text-gray-400">L</small>
          </p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-500">Top producer</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{topCow}</p>
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

        {(["ALL", "MORNING", "EVENING"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setShiftFilter(s)}
            className={`h-9 rounded-xl px-3 text-xs font-medium transition-colors ${shiftFilter === s ? "bg-emerald-600 text-white" : "border border-gray-200 bg-white text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"}`}
          >
            {s === "ALL" ? "All shifts" : s === "MORNING" ? "Morning" : "Evening"}
          </button>
        ))}

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
        />

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setShiftFilter("ALL"); setDateFilter(""); setPage(1); }}
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
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">ANIMAL</th>
                <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">DATE</th>
                <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">SHIFT</th>
                <th className="h-9 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">QUANTITY</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="h-20 text-center text-sm text-gray-400">
                    {allCattle.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <PawPrint className="h-6 w-6 text-gray-300" />
                        <p>No animals registered yet.</p>
                        <Link href="/herd" className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)">
                          Add an animal to get started
                        </Link>
                      </div>
                    ) : allRecords.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Droplets className="h-6 w-6 text-gray-300" />
                        <p>No production logged yet.</p>
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)"
                        >
                          Log your first record
                        </button>
                      </div>
                    ) : (
                      "No records match your filters."
                    )}
                  </td>
                </tr>
              )}
            {paginated.map((r) => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="h-14 px-5">
                    <div className="flex items-center gap-2.5">
                      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cowColor(r.cattleId)}`}>
                        <PawPrint className="h-4 w-4" />
                      </span>
                      <span>
                        <b className="block text-xs font-semibold text-gray-800">{r.cattleTagNumber}</b>
                        <small className="mt-0.5 block text-[11px] text-gray-400">{allCattle.find((c) => c.id === r.cattleId)?.breed ?? "Cattle"}</small>
                      </span>
                    </div>
                  </td>
                  <td className="h-14 px-3 text-xs text-gray-500">
                    {fmt.format(new Date(`${r.recordDate}T00:00:00`))}
                  </td>
                  <td className="h-14 px-3">
                    <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${r.shift === "MORNING" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}`}>
                      {r.shift === "MORNING" ? "Morning" : "Evening"}
                    </span>
                  </td>
                  <td className="h-14 px-5 text-right text-xs font-semibold text-gray-800">
                    {r.quantityLiters.toLocaleString("en-ZA", { maximumFractionDigits: 1 })}{" "}
                    <small className="font-normal text-gray-400">L</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-[11px] text-gray-400">
            {filtered.length === 0 ? "No records" : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={safePage === 1}
              className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >«</button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="grid h-7 w-7 place-items-center text-xs text-gray-300">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-medium transition-colors ${
                      safePage === p ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >{p}</button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >›</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
              className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >»</button>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-sky-500" />
                <h2 className="text-sm font-semibold text-gray-900">Add milk record</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="relative flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              <div className="grid gap-1.5" ref={cowRef}>
                <label className="text-xs font-medium text-gray-600">Animal</label>
                <button
                  type="button"
                  onClick={() => { setCowOpen((o) => !o); setCowSearch(""); }}
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                >
                  {selectedCow ? (
                    <span className="flex items-center gap-2">
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded ${cowColor(selectedCow.id)}`}>
                        <PawPrint className="h-3 w-3" />
                      </span>
                      <span className="font-medium">{selectedCow.tagNumber}</span>
                      <span className="text-gray-400">{selectedCow.breed}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">Select animal…</span>
                  )}
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
                {cowOpen && (
                  <div className="absolute z-10 mt-1 w-[calc(100%-2.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="relative border-b border-gray-100 p-2">
                      <Search className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search tag or breed…"
                        value={cowSearch}
                        onChange={(e) => setCowSearch(e.target.value)}
                        className="h-8 w-full rounded-lg bg-gray-50 pl-7 pr-3 text-xs text-gray-700 outline-none"
                      />
                    </div>
                    <ul className="max-h-48 overflow-y-auto py-1">
                      {filteredCattle.length === 0 && (
                        <li className="px-3 py-2 text-xs text-gray-400">No animals found.</li>
                      )}
                      {filteredCattle.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => { setFCow(String(c.id)); setCowOpen(false); setCowSearch(""); }}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                              fCow === String(c.id) ? "bg-green-50" : ""
                            }`}
                          >
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${cowColor(c.id)}`}>
                              <PawPrint className="h-3.5 w-3.5" />
                            </span>
                            <span className="font-medium text-gray-800">{c.tagNumber}</span>
                            <span className="text-xs text-gray-400">{c.breed}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Date</label>
                <input
                  type="date"
                  value={fDate}
                  max={today()}
                  onChange={(e) => setFDate(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Shift</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["MORNING", "EVENING"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFShift(s)}
                      className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-colors ${fShift === s ? "border-(--brand) bg-green-50 text-(--brand)" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      {s === "MORNING" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {s === "MORNING" ? "Morning" : "Evening"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Quantity (litres)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="e.g. 12.5"
                  value={fQty}
                  onChange={(e) => setFQty(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>

              {fErr && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{fErr}</p>}

              <div className="mt-auto grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fSaving}
                  className="h-10 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {fSaving ? "Saving…" : "Save record"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
