"use client";

import { useRef, useEffect, useMemo, useState, Fragment } from "react";
import gsap from "gsap";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  PawPrint,
  Plus,
  Search,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { useFarm } from "@/lib/farm-store";
import { Severity, type HealthStatus } from "@/lib/seed-data";
import {
  ageLabel,
  cowColor,
  severityText,
  severityTone,
  statusText,
  statusTone,
} from "@/lib/status";

const today = () => new Date().toLocaleDateString("en-CA");

const STATUS_FILTERS: { label: string; value: HealthStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Healthy", value: "HEALTHY" },
  { label: "Recovered", value: "RECOVERED" },
  { label: "In treatment", value: "UNDER_TREATMENT" },
  { label: "Sick", value: "SICK" },
  { label: "Deceased", value: "DECEASED" },
];

export default function HealthPage() {
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

  const { cattle, healthRecords, addHealthRecord } = useFarm();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<HealthStatus | "ALL">("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // form state
  const [fCow, setFCow] = useState(String(cattle[0]?.id ?? ""));
  const [fDate, setFDate] = useState(today());
  const [fComplaint, setFComplaint] = useState("");
  const [fNotes, setFNotes] = useState("");
  const [fSeverity, setFSeverity] = useState<Severity>("LOW");
  const [fTreatedBy, setFTreatedBy] = useState("");
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

  // KPIs
  const active = cattle.filter((c) => c.healthStatus !== "DECEASED").length;
  const sick = cattle.filter((c) => c.healthStatus === "SICK").length;
  const inTreatment = cattle.filter((c) => c.healthStatus === "UNDER_TREATMENT").length;
  const recovered = cattle.filter((c) => c.healthStatus === "RECOVERED").length;

  // records grouped by cattle id
  const recordsByCattle = useMemo(() => {
    const map = new Map<number, typeof healthRecords>();
    for (const r of healthRecords) {
      const list = map.get(r.cattleId) ?? [];
      list.push(r);
      map.set(r.cattleId, list);
    }
    return map;
  }, [healthRecords]);

  const filtered = useMemo(() => {
    return cattle.filter((c) => {
      if (statusFilter !== "ALL" && c.healthStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.tagNumber.toLowerCase().includes(q) && !c.breed.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [cattle, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!fCow) return setFErr("Select an animal.");
    if (!fDate) return setFErr("Pick a date.");
    if (!fComplaint.trim()) return setFErr("Enter a complaint.");
    if (!fTreatedBy.trim()) return setFErr("Enter who treated the animal.");
    setFErr("");
    setFSaving(true);
    try {
      await addHealthRecord({
        cattleId: Number(fCow),
        date: fDate,
        complaint: fComplaint.trim(),
        notes: fNotes.trim(),
        severity: fSeverity,
        treatedBy: fTreatedBy.trim(),
      });
      setFComplaint(""); setFNotes(""); setFTreatedBy("");
      setOpen(false);
    } catch (err) {
      setFErr(err instanceof Error ? err.message : "Could not save the record. Please try again.");
    } finally {
      setFSaving(false);
    }
  }

  return (
    <div ref={pageRef}>
      <section className="gs-header mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Health records</h1>
          <p className="mt-1.5 text-sm text-gray-500">Animal health status and complaint history.</p>
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
        <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-5">
          <BrandMark className="pointer-events-none absolute -right-5 -bottom-6 h-28 w-28 text-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Active herd</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><PawPrint className="h-4 w-4" /></span>
          </div>
          <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{active}</strong>
          <p className="relative mt-2 text-xs text-white/70">Currently on the farm</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <AlertTriangle className="h-3.5 w-3.5" /> Sick
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{sick}</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <HeartPulse className="h-3.5 w-3.5" /> In treatment
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{inTreatment}</p>
        </article>
        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
            <CheckCircle2 className="h-3.5 w-3.5" /> Recovered
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{recovered}</p>
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
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`h-9 rounded-xl px-3 text-xs font-medium transition-colors ${statusFilter === value ? "bg-(--brand) text-white" : "border border-gray-200 bg-white text-gray-500 hover:bg-(--brand-light) hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {(search || statusFilter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("ALL"); setPage(1); }}
            className="h-9 rounded-xl px-3 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} animal{filtered.length !== 1 ? "s" : ""}</span>
      </section>

      {/* Table */}
      <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="h-9 w-8 px-3" />
                <th className="h-9 px-4 text-[10px] font-semibold tracking-wide text-gray-400">ANIMAL</th>
                <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">BREED</th>
                <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">AGE</th>
                <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STATUS</th>
                <th className="h-9 px-4 text-right text-[10px] font-semibold tracking-wide text-gray-400">RECORDS</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-20 text-center text-sm text-gray-400">
                    {cattle.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <PawPrint className="h-6 w-6 text-gray-300" />
                        <p>No animals registered yet.</p>
                        <Link href="/herd" className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)">
                          Add an animal to get started
                        </Link>
                      </div>
                    ) : (
                      "No animals match your filters."
                    )}
                  </td>
                </tr>
              )}
              {paginated.map((c) => {
                const recs = (recordsByCattle.get(c.id) ?? []).sort((a, b) => b.date.localeCompare(a.date));
                const isOpen = expanded === c.id;
                return (
                  <Fragment key={c.id}>
                    <tr
                      key={c.id}
                      onClick={() => setExpanded(isOpen ? null : c.id)}
                      className="cursor-pointer border-t border-gray-100 hover:bg-gray-50/60"
                    >
                      <td className="px-3 py-0">
                        <span className="grid h-6 w-6 place-items-center rounded-md text-gray-300">
                          {isOpen
                            ? <ChevronDown className="h-4 w-4 text-gray-500" />
                            : <ChevronRight className="h-4 w-4" />}
                        </span>
                      </td>
                      <td className="h-14 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cowColor(c.id)}`}>
                            <PawPrint className="h-4 w-4" />
                          </span>
                          <b className="text-xs font-semibold text-gray-800">{c.tagNumber}</b>
                        </div>
                      </td>
                      <td className="h-14 px-3 text-xs text-gray-500">{c.breed}</td>
                      <td className="h-14 px-3 text-xs text-gray-500">{ageLabel(c.dateOfBirth)}</td>
                      <td className="h-14 px-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusTone[c.healthStatus]}`}>
                          {statusText[c.healthStatus]}
                        </span>
                      </td>
                      <td className="h-14 px-4 text-right">
                        {recs.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                            <ClipboardList className="h-3 w-3" /> {recs.length}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-300">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded complaints */}
                    {isOpen && (
                      <tr key={`${c.id}-expanded`} className="border-t border-gray-100 bg-gray-50/40">
                        <td colSpan={6} className="px-5 py-4">
                          {recs.length === 0 ? (
                            <p className="text-xs text-gray-400">No health records for this animal yet.</p>
                          ) : (
                            <div className="relative ml-2 grid gap-0">
                              {/* vertical timeline line */}
                              <div className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px bg-gray-200" />
                              {recs.map((r) => (
                                <div key={r.id} className="relative flex gap-4 pb-4 last:pb-0">
                                  <span className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-white ${
                                    r.severity === "HIGH" ? "bg-rose-400" : r.severity === "MEDIUM" ? "bg-amber-400" : "bg-(--brand-light)"
                                  }`} />
                                  <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-white p-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-semibold text-gray-800">{r.complaint}</span>
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${severityTone[r.severity]}`}>
                                        {severityText[r.severity]}
                                      </span>
                                      <span className="ml-auto text-[11px] text-gray-400">{r.date}</span>
                                    </div>
                                    {r.notes && (
                                      <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">{r.notes}</p>
                                    )}
                                    <p className="mt-1.5 text-[10px] text-gray-400">Treated by: <span className="font-medium text-gray-600">{r.treatedBy}</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setFCow(String(c.id)); setOpen(true); }}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-(--brand-light) hover:text-(--brand)"
                          >
                            <Plus className="h-3.5 w-3.5" /> Add complaint
                          </button>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <span className="text-[11px] text-gray-400">
            {filtered.length === 0 ? "No animals" : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={safePage === 1} className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`e-${i}`} className="grid h-7 w-7 place-items-center text-xs text-gray-300">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)} className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-medium transition-colors ${safePage === p ? "bg-(--brand) text-white" : "text-gray-500 hover:bg-(--brand-light) hover:text-white"}`}>{p}</button>
                )
              )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">›</button>
            <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} className="grid h-7 w-7 place-items-center rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30">»</button>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-gray-900">Add health record</h2>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="relative flex flex-1 flex-col gap-5 overflow-y-auto p-5">

              {/* Animal picker */}
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
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${fCow === String(c.id) ? "bg-green-50" : ""}`}
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

              {/* Date */}
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

              {/* Complaint */}
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Complaint</label>
                <input
                  type="text"
                  placeholder="e.g. Fever, Lameness, Routine check…"
                  value={fComplaint}
                  onChange={(e) => setFComplaint(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>

              {/* Severity */}
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["LOW", "MEDIUM", "HIGH"] as Severity[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFSeverity(s)}
                      className={`h-9 rounded-xl border text-xs font-medium transition-colors ${fSeverity === s ? `border-transparent ${severityTone[s]}` : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      {severityText[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Notes <span className="text-gray-400">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="Observations, treatment given, follow-up needed…"
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  className="resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
                />
              </div>

              {/* Treated by */}
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Treated by</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Mokoena, Farm Admin…"
                  value={fTreatedBy}
                  onChange={(e) => setFTreatedBy(e.target.value)}
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
