"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Banknote, Calendar, CheckCircle2, Pencil, Phone, Trash2, X } from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { formatMoney } from "@/lib/currency";
import { cowColor } from "@/lib/status";
import { updateWorker, deleteWorker } from "@/lib/farm-api";
import type { EmploymentStatus, Worker, WorkerRole } from "@/lib/workers-data";

const ROLE_LABEL: Record<WorkerRole, string> = {
  FARM_OWNER:     "Farm Owner",
  FRONT_DESK:     "Front Desk",
  HERDER:         "Herder",
  MILKER:         "Milker",
  VET_TECHNICIAN: "Vet Technician",
  GENERAL_LABOR:  "General Labor",
};

const STATUS_LABEL: Record<EmploymentStatus, string> = {
  ACTIVE:   "Active",
  ON_LEAVE: "On leave",
  FORMER:   "Former",
};

const STATUS_TONE: Record<EmploymentStatus, string> = {
  ACTIVE:   "bg-emerald-50 text-emerald-700",
  ON_LEAVE: "bg-amber-50 text-amber-700",
  FORMER:   "bg-gray-100 text-gray-500",
};

const STATUS_DOT: Record<EmploymentStatus, string> = {
  ACTIVE:   "bg-emerald-500",
  ON_LEAVE: "bg-amber-400",
  FORMER:   "bg-gray-300",
};

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`)
  );
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.\s*/, "").split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

function tenure(startDate: string) {
  const months = Math.floor((Date.now() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""}`;
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  return mo > 0 ? `${yrs} yr ${mo} mo` : `${yrs} yr`;
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const today = () => new Date().toLocaleDateString("en-CA");

export default function WorkerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { workers, transactions, refetch } = useFarm();
  const worker = workers.find((w) => String(w.id) === params.id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm text-gray-500">We couldn&apos;t find that worker.</p>
        <Link href="/workers" className="text-xs font-semibold text-(--brand)">← Back to workers</Link>
      </div>
    );
  }

  const paymentHistory = transactions
    .filter((t) => t.category === "LABOR" && t.reference === `worker:${worker.id}`)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalPaid = paymentHistory.reduce((sum, t) => sum + t.amount, 0);
  const monthKey = currentMonthKey();
  const paidThisMonth = paymentHistory.some((t) => t.date.startsWith(monthKey));

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteWorker(worker!.id);
      refetch();
      router.push("/workers");
    } catch (err) {
      setDeleting(false);
      alert(err instanceof Error ? err.message : "Could not delete worker.");
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/workers" className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to workers
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="mb-6 flex flex-wrap items-center gap-4">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${cowColor(worker.id)}`}>
          <span className="text-base font-bold">{initials(worker.name)}</span>
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{worker.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {ROLE_LABEL[worker.role]} · {tenure(worker.startDate)} tenure
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_TONE[worker.status]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[worker.status]}`} />
          {STATUS_LABEL[worker.status]}
        </span>
      </section>

      {/* Stat cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Monthly salary</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {worker.monthlySalary ? formatMoney(worker.monthlySalary) : <span className="text-gray-300">—</span>}
          </p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Total paid</p>
          <p className="mt-1 text-xl font-bold text-(--brand)">{formatMoney(totalPaid)}</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Start date</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{fmtDate(worker.startDate)}</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">This month</p>
          <p className={`mt-1 text-xl font-bold ${paidThisMonth ? "text-emerald-600" : "text-gray-300"}`}>
            {paidThisMonth ? "Paid ✓" : "Unpaid"}
          </p>
        </article>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Profile</h2>
          <div className="grid gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Full name</span>
              <span className="font-semibold text-gray-800">{worker.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Role</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">{ROLE_LABEL[worker.role]}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Phone</span>
              <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                <Phone className="h-3 w-3 text-gray-400" /> {worker.phone}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Start date</span>
              <span className="inline-flex items-center gap-1 font-semibold text-gray-800">
                <Calendar className="h-3 w-3 text-gray-400" /> {fmtDate(worker.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Tenure</span>
              <span className="font-semibold text-gray-800">{tenure(worker.startDate)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Status</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${STATUS_TONE[worker.status]}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[worker.status]}`} />
                {STATUS_LABEL[worker.status]}
              </span>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Salary summary</h2>
          <div className="grid gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Monthly rate</span>
              <span className="font-semibold text-gray-800">
                {worker.monthlySalary ? formatMoney(worker.monthlySalary) : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Payments recorded</span>
              <span className="font-semibold text-gray-800">{paymentHistory.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Total paid out</span>
              <span className="font-semibold text-(--brand)">{formatMoney(totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">This month</span>
              {paidThisMonth ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" /> Paid
                </span>
              ) : (
                <span className="font-medium text-gray-400">Not yet paid</span>
              )}
            </div>
          </div>
        </article>
      </section>

      {/* Payment history */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-5 py-4">
          <Banknote className="h-4 w-4 text-emerald-500" />
          <h2 className="text-sm font-semibold text-gray-900">Payment history</h2>
        </div>
        {paymentHistory.length === 0 ? (
          <p className="pb-6 text-center text-sm text-gray-400">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">DATE</th>
                  <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">DESCRIPTION</th>
                  <th className="h-9 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((t) => (
                  <tr key={t.id} className="border-t border-gray-100">
                    <td className="h-12 px-5 text-xs text-gray-500">{fmtDate(t.date)}</td>
                    <td className="h-12 px-3 text-xs text-gray-700">{t.description}</td>
                    <td className="h-12 px-5 text-right text-xs font-semibold text-gray-800">{formatMoney(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit panel */}
      {editOpen && (
        <EditWorkerPanel
          worker={worker}
          onClose={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); refetch(); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDeleteOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-sm font-semibold text-gray-900">Delete worker?</h2>
            <p className="mt-2 text-xs text-gray-500">
              This will permanently remove <strong>{worker.name}</strong> from the system. This action cannot be undone.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditWorkerPanel({
  worker,
  onClose,
  onSaved,
}: {
  worker: Worker;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(worker.name);
  const [role, setRole] = useState<WorkerRole>(worker.role);
  const [phone, setPhone] = useState(worker.phone);
  const [startDate, setStartDate] = useState(worker.startDate);
  const [status, setStatus] = useState<EmploymentStatus>(worker.status);
  const [monthlySalary, setMonthlySalary] = useState(worker.monthlySalary?.toString() ?? "");
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

    setError("");
    setSaving(true);
    try {
      await updateWorker(worker.id, { name: name.trim(), role, phone: phone.trim(), startDate, status, monthlySalary: salary });
      onSaved();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not save changes.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Edit worker</h2>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100"><X className="h-4 w-4 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as WorkerRole)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50">
              {(Object.keys(ROLE_LABEL) as WorkerRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
          </div>
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Start date</label>
            <input type="date" value={startDate} max={today()} onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
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
              <input type="number" min="1" step="1" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
            </div>
          )}
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
          <div className="mt-auto grid grid-cols-2 gap-2">
            <button type="button" onClick={onClose}
              className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="h-10 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
