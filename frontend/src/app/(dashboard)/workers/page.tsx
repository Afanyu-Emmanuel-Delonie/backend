"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Banknote, CheckCircle2, ChevronLeft, ChevronRight, Database,
  Mail, Phone, Plus, Search, Shield, Trash2, UserCheck, UserMinus, Users, X,
} from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { formatMoney } from "@/lib/currency";
import { BrandMark } from "@/components/BrandMark";
import { cowColor } from "@/lib/status";
import { getStoredUser } from "@/lib/auth-api";
import type { UserResponse } from "@/lib/auth-api";
import type { EmploymentStatus, Worker, WorkerRole } from "@/lib/workers-data";
import { seedWorkers } from "@/lib/workers-data";
import { seedWorkersApi, fetchFarmUsers, fetchInvites, createInvite, revokeInvite } from "@/lib/farm-api";
import type { Invite, InviteRole } from "@/lib/farm-api";

const PAGE_SIZE = 10;

const ROLE_LABEL: Record<WorkerRole, string> = {
  FARM_OWNER: "Farm Owner", FRONT_DESK: "Front Desk", HERDER: "Herder",
  MILKER: "Milker", VET_TECHNICIAN: "Vet Technician", GENERAL_LABOR: "General Labor",
};
const STATUS_LABEL: Record<EmploymentStatus, string> = {
  ACTIVE: "Active", ON_LEAVE: "On leave", FORMER: "Former",
};
const STATUS_TONE: Record<EmploymentStatus, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  ON_LEAVE: "bg-amber-50 text-amber-700",
  FORMER: "bg-gray-100 text-gray-500",
};
const STATUS_DOT: Record<EmploymentStatus, string> = {
  ACTIVE: "bg-emerald-500", ON_LEAVE: "bg-amber-400", FORMER: "bg-gray-300",
};
const INVITE_STATUS_TONE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  REVOKED: "bg-gray-100 text-gray-400",
};
const USER_ROLE_TONE: Record<string, string> = {
  FARM_OWNER: "bg-violet-50 text-violet-700",
  WORKER: "bg-sky-50 text-sky-700",
  BRANCH: "bg-orange-50 text-orange-700",
};

const today = () => new Date().toLocaleDateString("en-CA");
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function initials(name: string) {
  const p = name.replace(/^Dr\.\s*/, "").split(" ");
  return ((p[0]?.[0] ?? "") + (p[p.length - 1]?.[0] ?? "")).toUpperCase();
}
function tenure(s: string) {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (m < 12) return `${m} mo`;
  const y = Math.floor(m / 12), mo = m % 12;
  return mo > 0 ? `${y}y ${mo}mo` : `${y}y`;
}
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${iso}T00:00:00`));
}

export default function WorkersPage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".gs-header", { y: -16, opacity: 0, duration: 0.45 })
        .from(".gs-card", { y: 24, opacity: 0, duration: 0.4, stagger: 0.08 }, "-=0.2")
        .from(".gs-section", { y: 20, opacity: 0, duration: 0.4, stagger: 0.12 }, "-=0.2");
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const { workers, addWorker, addTransaction, transactions, refetch } = useFarm();
  const currentUser = getStoredUser();
  const isOwner = currentUser?.role === "FARM_OWNER";

  const [tab, setTab] = useState<"workers" | "access">("workers");
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<WorkerRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [farmUsers, setFarmUsers] = useState<UserResponse[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (tab === "access" && isOwner) {
      setAccessLoading(true);
      Promise.all([fetchFarmUsers(), fetchInvites()])
        .then(([users, inv]) => { setFarmUsers(users); setInvites(inv); })
        .catch(() => {})
        .finally(() => setAccessLoading(false));
    }
  }, [tab, isOwner]);

  const monthKey = currentMonthKey();
  const paidThisMonth = useMemo(() => {
    const paid = new Set<number>();
    transactions.forEach((t) => {
      if (t.category === "LABOR" && t.date.startsWith(monthKey) && t.reference?.startsWith("worker:")) {
        const id = parseInt(t.reference.split(":")[1], 10);
        if (!isNaN(id)) paid.add(id);
      }
    });
    return paid;
  }, [transactions, monthKey]);

  async function handleSeed() {
    setSeeding(true);
    try {
      await seedWorkersApi(seedWorkers.map(({ id: _id, ...rest }) => rest));
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Seeding failed.");
    } finally { setSeeding(false); }
  }

  async function markPaid(w: Worker) {
    if (!w.monthlySalary) return;
    try {
      await addTransaction({
        type: "EXPENSE", category: "LABOR",
        description: `Salary — ${w.name}`,
        amount: w.monthlySalary, date: today(),
        reference: `worker:${w.id}`,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not log the payment.");
    }
  }

  async function handleRevokeInvite(id: number) {
    try {
      await revokeInvite(id);
      setInvites((prev) => prev.map((i) => i.id === id ? { ...i, status: "REVOKED" as const } : i));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not revoke invite.");
    }
  }

  const active = workers.filter((w) => w.status === "ACTIVE");
  const onLeave = workers.filter((w) => w.status === "ON_LEAVE");
  const monthlyPayroll = active.reduce((sum, w) => sum + (w.monthlySalary ?? 0), 0);
  const paidTotal = active.filter((w) => w.monthlySalary && paidThisMonth.has(w.id))
    .reduce((sum, w) => sum + (w.monthlySalary ?? 0), 0);

  const filtered = workers.filter((w) => {
    if (roleFilter !== "ALL" && w.role !== roleFilter) return false;
    if (statusFilter !== "ALL" && w.status !== statusFilter) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filterKey = `${search}|${roleFilter}|${statusFilter}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) { setPrevKey(filterKey); setPage(1); }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers: number[] = [];
  for (let p = Math.max(1, safePage - 2); p <= Math.min(totalPages, safePage + 2); p++) pageNumbers.push(p);
  const hasFilters = search || roleFilter !== "ALL" || statusFilter !== "ALL";

  return (
    <div ref={pageRef}>
      {/* Page header */}
      <section className="gs-header mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Workers</h1>
          <p className="mt-1.5 text-sm text-gray-500">{workers.length} people on the payroll.</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "workers" && workers.length === 0 && (
            <button type="button" onClick={handleSeed} disabled={seeding}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60">
              <Database className="h-4 w-4" /> {seeding ? "Seeding…" : "Seed data"}
            </button>
          )}
          {tab === "workers" && (
            <button type="button" onClick={() => setOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover)">
              <Plus className="h-4 w-4" /> Add worker
            </button>
          )}
          {tab === "access" && isOwner && (
            <button type="button" onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white hover:bg-(--brand-hover)">
              <Mail className="h-4 w-4" /> Send invite
            </button>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="gs-header mb-5 flex gap-1 border-b border-gray-100">
        <button onClick={() => setTab("workers")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "workers" ? "border-(--brand) text-(--brand)" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
          Workers
        </button>
        {isOwner && (
          <button onClick={() => setTab("access")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === "access" ? "border-(--brand) text-(--brand)" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
            <Shield className="h-3.5 w-3.5" /> System Access
          </button>
        )}
      </div>

      {/* Workers tab */}
      {tab === "workers" && (
        <>
          <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-5">
              <BrandMark className="pointer-events-none absolute -right-5 -bottom-6 h-28 w-28 text-white/10" />
              <div className="relative flex items-center justify-between">
                <span className="text-xs font-medium text-white/70">Total workers</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><Users className="h-4 w-4" /></span>
              </div>
              <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{workers.length}</strong>
              <p className="relative mt-2 text-xs text-white/70">All-time roster</p>
            </article>
            <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Active</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><UserCheck className="h-4 w-4" /></span>
              </div>
              <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{active.length}</strong>
              <p className="mt-2 text-xs text-gray-500">Currently working</p>
            </article>
            <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">On leave</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600"><UserMinus className="h-4 w-4" /></span>
              </div>
              <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{onLeave.length}</strong>
              <p className="mt-2 text-xs text-gray-500">Temporarily away</p>
            </article>
            <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Monthly payroll</span>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600"><Banknote className="h-4 w-4" /></span>
              </div>
              <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{formatMoney(monthlyPayroll)}</strong>
              <p className="mt-2 text-xs text-gray-500">
                {paidTotal > 0
                  ? <span className="text-emerald-600 font-medium">{formatMoney(paidTotal)} paid this month</span>
                  : "Active wages only"}
              </p>
            </article>
          </section>

          <section className="gs-section mb-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search name…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
            </div>
            {(["ALL", "ACTIVE", "ON_LEAVE", "FORMER"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setStatusFilter(s)}
                className={`h-9 rounded-xl px-3 text-xs font-medium transition-colors ${statusFilter === s ? "bg-(--brand) text-white" : "border border-gray-200 bg-white text-gray-500 hover:bg-(--brand-light) hover:text-(--brand)"}`}>
                {s === "ALL" ? "All statuses" : STATUS_LABEL[s]}
              </button>
            ))}
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as WorkerRole | "ALL")}
              className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-(--brand-light)">
              <option value="ALL">All roles</option>
              {(Object.keys(ROLE_LABEL) as WorkerRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            {hasFilters && (
              <button onClick={() => { setRoleFilter("ALL"); setStatusFilter("ALL"); setSearch(""); }}
                className="h-9 rounded-xl px-3 text-xs font-medium text-rose-500 hover:bg-rose-50">Clear</button>
            )}
            <span className="ml-auto text-xs text-gray-400">{filtered.length} worker{filtered.length !== 1 ? "s" : ""}</span>
          </section>
        </>
      )}

      {tab === "workers" && (
        <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="h-11 px-5 text-[10px] font-semibold tracking-wide text-gray-400">WORKER</th>
                  <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">ROLE</th>
                  <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">TENURE</th>
                  <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STATUS</th>
                  <th className="h-11 px-3 text-right text-[10px] font-semibold tracking-wide text-gray-400">SALARY / MO</th>
                  <th className="h-11 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">THIS MONTH</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr><td colSpan={6} className="h-24 text-center text-sm text-gray-400">
                    {workers.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Users className="h-6 w-6 text-gray-300" />
                        <p>No workers added yet.</p>
                        <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-(--brand)">Add your first worker</button>
                      </div>
                    ) : "No workers match your filters."}
                  </td></tr>
                )}
                {paginated.map((w) => {
                  const isPaid = paidThisMonth.has(w.id);
                  const canPay = w.status === "ACTIVE" && !!w.monthlySalary && !isPaid;
                  return (
                    <tr key={w.id} className="border-t border-gray-100 hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => router.push(`/workers/${w.id}`)}>
                      <td className="h-16 px-5">
                        <div className="flex items-center gap-3">
                          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${cowColor(w.id)}`}>
                            <span className="text-xs font-bold">{initials(w.name)}</span>
                          </span>
                          <div className="min-w-0">
                            <b className="block truncate text-xs font-semibold text-gray-800">{w.name}</b>
                            <small className="flex items-center gap-1 text-[11px] text-gray-400"><Phone className="h-2.5 w-2.5" /> {w.phone}</small>
                          </div>
                        </div>
                      </td>
                      <td className="h-16 px-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">{ROLE_LABEL[w.role]}</span></td>
                      <td className="h-16 px-3 text-xs text-gray-500">{tenure(w.startDate)}</td>
                      <td className="h-16 px-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_TONE[w.status]}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[w.status]}`} />{STATUS_LABEL[w.status]}
                        </span>
                      </td>
                      <td className="h-16 px-3 text-right text-xs font-semibold text-gray-700">
                        {w.monthlySalary ? formatMoney(w.monthlySalary) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="h-16 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        {w.role === "FARM_OWNER" ? <span className="text-xs text-gray-300">Owner</span>
                          : isPaid ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-700"><CheckCircle2 className="h-3 w-3" /> Paid</span>
                          : canPay ? <button type="button" onClick={() => markPaid(w)} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-(--brand) px-3 text-xs font-semibold text-white hover:bg-(--brand-hover)"><Banknote className="h-3.5 w-3.5" /> Mark paid</button>
                          : <span className="text-xs text-gray-300">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-gray-400">
              {filtered.length === 0 ? "No workers" : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40"><ChevronLeft className="h-3.5 w-3.5" /></button>
              {pageNumbers[0] > 1 && <span className="px-1 text-xs text-gray-300">…</span>}
              {pageNumbers.map((p) => (
                <button key={p} type="button" onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors ${p === safePage ? "bg-(--brand) text-white" : "text-gray-500 hover:bg-(--brand-light) hover:text-(--brand)"}`}>{p}</button>
              ))}
              {pageNumbers[pageNumbers.length - 1] < totalPages && <span className="px-1 text-xs text-gray-300">…</span>}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </section>
      )}

      {/* System Access tab */}
      {tab === "access" && isOwner && (
        <>
          {accessLoading ? (
            <p className="py-12 text-center text-sm text-gray-400">Loading…</p>
          ) : (
            <>
              <section className="gs-section mb-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                  <Users className="h-4 w-4 text-violet-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Farm accounts</h2>
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{farmUsers.length}</span>
                </div>
                {farmUsers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No accounts found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">USER</th>
                          <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">ROLE</th>
                          <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">PHONE</th>
                          <th className="h-9 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">JOINED</th>
                        </tr>
                      </thead>
                      <tbody>
                        {farmUsers.map((u) => (
                          <tr key={u.id} className="border-t border-gray-100">
                            <td className="h-14 px-5">
                              <div className="flex items-center gap-3">
                                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${cowColor(u.id)}`}>
                                  <span className="text-[10px] font-bold">{(u.fullName[0] ?? "").toUpperCase()}</span>
                                </span>
                                <div className="min-w-0">
                                  <b className="block truncate text-xs font-semibold text-gray-800">{u.fullName}</b>
                                  <small className="truncate text-[11px] text-gray-400">{u.email}</small>
                                </div>
                              </div>
                            </td>
                            <td className="h-14 px-3">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${USER_ROLE_TONE[u.role] ?? "bg-gray-100 text-gray-500"}`}>{u.role}</span>
                            </td>
                            <td className="h-14 px-3 text-xs text-gray-500">{u.phone ?? "—"}</td>
                            <td className="h-14 px-5 text-right text-xs text-gray-500">{fmtDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                  <Mail className="h-4 w-4 text-sky-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Invites</h2>
                  <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{invites.length}</span>
                </div>
                {invites.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No invites sent yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">EMAIL</th>
                          <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">ROLE</th>
                          <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STATUS</th>
                          <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">SENT</th>
                          <th className="h-9 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invites.map((inv) => (
                          <tr key={inv.id} className="border-t border-gray-100">
                            <td className="h-12 px-5 text-xs font-medium text-gray-800">{inv.email}</td>
                            <td className="h-12 px-3"><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">{inv.role}</span></td>
                            <td className="h-12 px-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${INVITE_STATUS_TONE[inv.status] ?? "bg-gray-100 text-gray-500"}`}>{inv.status}</span></td>
                            <td className="h-12 px-3 text-xs text-gray-500">{fmtDate(inv.sentAt)}</td>
                            <td className="h-12 px-5 text-right">
                              {inv.status === "PENDING" && (
                                <button onClick={() => handleRevokeInvite(inv.id)}
                                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-rose-500 hover:bg-rose-50">
                                  <Trash2 className="h-3 w-3" /> Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      {open && <AddWorkerPanel onClose={() => setOpen(false)} onAdd={addWorker} />}
      {inviteOpen && (
        <SendInvitePanel
          onClose={() => setInviteOpen(false)}
          onSent={(inv) => { setInvites((prev) => [inv, ...prev]); setInviteOpen(false); }}
        />
      )}
    </div>
  );
}

function AddWorkerPanel({ onClose, onAdd }: { onClose: () => void; onAdd: (input: Omit<Worker, "id">) => Promise<Worker> }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<WorkerRole>("GENERAL_LABOR");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(today());
  const [status, setStatus] = useState<EmploymentStatus>("ACTIVE");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter a name.");
    if (!phone.trim()) return setError("Enter a phone number.");
    let salary: number | undefined;
    if (role !== "FARM_OWNER") {
      salary = parseFloat(monthlySalary);
      if (isNaN(salary) || salary <= 0) return setError("Enter a valid monthly salary.");
    }
    setError(""); setSaving(true);
    try {
      await onAdd({ name: name.trim(), role, phone: phone.trim(), startDate, status, monthlySalary: salary });
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not save the worker.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Add worker</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Full name</label>
            <input type="text" placeholder="e.g. Alice Mukamana" value={name} onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as WorkerRole)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light)">
              {(Object.keys(ROLE_LABEL) as WorkerRole[]).map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Phone</label>
            <input type="text" placeholder="e.g. +250 788 000 000" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light)" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Start date</label>
            <input type="date" value={startDate} max={today()} onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light)" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["ACTIVE", "ON_LEAVE", "FORMER"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`h-9 rounded-xl border text-xs font-medium transition-colors ${status === s ? "border-(--brand) bg-green-50 text-(--brand)" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
          {role !== "FARM_OWNER" && (
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-gray-600">Monthly salary (RWF)</label>
              <input type="number" min="1" step="1" placeholder="e.g. 80000" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light)" />
            </div>
          )}
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
              {saving ? "Saving…" : "Save worker"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function SendInvitePanel({ onClose, onSent }: { onClose: () => void; onSent: (inv: Invite) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("WORKER");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Enter an email address.");
    setError(""); setSaving(true);
    try {
      const inv = await createInvite({ email: email.trim(), role });
      onSent(inv);
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not send invite.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Send invite</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-5">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Email address</label>
            <input type="email" placeholder="e.g. jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {(["WORKER", "BRANCH"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`h-9 rounded-xl border text-xs font-medium transition-colors ${role === r ? "border-(--brand) bg-green-50 text-(--brand)" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
                  {r === "WORKER" ? "Worker" : "Branch"}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose} className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="h-10 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
              {saving ? "Sending…" : "Send invite"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
