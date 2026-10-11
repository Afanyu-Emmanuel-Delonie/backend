"use client";

import { useMemo, useRef, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  HeartPulse, PawPrint, TrendingUp, TrendingDown, Download,
  Milk, Wallet, Users, Sunrise, Sunset, AlertTriangle, ClipboardList, Tag, CheckCircle2, Receipt,
} from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { formatMoney } from "@/lib/currency";
import { statusText, statusTone } from "@/lib/status";
import { StatCard } from "@/components/StatCard";

function isoMonthKey(date: string) { return date.slice(0, 7); }
function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en-US", { month: "short" });
}
function isoDaysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toLocaleDateString("en-CA");
}
function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

const HEALTH_COLORS: Record<string, string> = {
  HEALTHY: "#10b981", RECOVERED: "#34d399",
  UNDER_TREATMENT: "#f59e0b", SICK: "#f97316", DECEASED: "#d1d5db",
};
const COST_COLORS = ["#6366f1","#f59e0b","#10b981","#f87171","#38bdf8","#a78bfa","#fb923c"];

type Section = "production" | "health" | "finance" | "herd";

const SECTIONS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "production", label: "Production", icon: Milk },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "herd", label: "Herd", icon: PawPrint },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3 print:mb-3">
      <h2 className="text-base font-bold tracking-tight text-gray-900">{children}</h2>
      <div className="flex-1 border-t border-gray-100" />
    </div>
  );
}

export default function ReportsPage() {
  const { cattle, records, healthRecords, transactions, workers } = useFarm();
  const printRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Section>("production");

  function handleExport() {
    window.print();
  }

  // ── Production ────────────────────────────────────────────────────────────
  const totalMilk = records.reduce((s, r) => s + r.quantityLiters, 0);
  const avgDaily = useMemo(() => {
    const days = new Set(records.map(r => r.recordDate)).size || 1;
    return totalMilk / days;
  }, [records, totalMilk]);
  const morningTotal = records.filter(r => r.shift === "MORNING").reduce((s, r) => s + r.quantityLiters, 0);
  const eveningTotal = records.filter(r => r.shift === "EVENING").reduce((s, r) => s + r.quantityLiters, 0);

  const milkTrend30 = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const date = isoDaysAgo(29 - i);
      const total = records.filter(r => r.recordDate === date).reduce((s, r) => s + r.quantityLiters, 0);
      return { date: shortDate(date), total };
    }), [records]);

  const cowTotals = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of records) map.set(r.cattleId, (map.get(r.cattleId) ?? 0) + r.quantityLiters);
    return [...map.entries()]
      .map(([id, total]) => ({ tag: cattle.find(c => c.id === id)?.tagNumber ?? "—", total }))
      .sort((a, b) => b.total - a.total).slice(0, 8);
  }, [records, cattle]);

  // ── Health ────────────────────────────────────────────────────────────────
  const active_ = cattle.filter(c => c.healthStatus !== "DECEASED");
  const healthBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cattle) counts[c.healthStatus] = (counts[c.healthStatus] ?? 0) + 1;
    return Object.entries(counts).map(([status, value]) => ({
      name: statusText[status as keyof typeof statusText] ?? status,
      value, color: HEALTH_COLORS[status] ?? "#d1d5db", status,
    }));
  }, [cattle]);

  const conditionCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of healthRecords) map.set(r.complaint, (map.get(r.complaint) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value).slice(0, 6);
  }, [healthRecords]);

  const recentHealth = [...healthRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  // ── Finance ───────────────────────────────────────────────────────────────
  const totalRevenue = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalCosts = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const monthlyPayroll = workers.filter(w => w.status === "ACTIVE" && w.monthlySalary).reduce((s, w) => s + (w.monthlySalary ?? 0), 0);

  const monthlyFinance = useMemo(() => {
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys.map(key => ({
      month: monthLabel(key),
      revenue: transactions.filter(t => t.type === "INCOME" && isoMonthKey(t.date) === key).reduce((s, t) => s + t.amount, 0),
      costs: transactions.filter(t => t.type === "EXPENSE" && isoMonthKey(t.date) === key).reduce((s, t) => s + t.amount, 0),
    }));
  }, [transactions]);

  const costByCategory = useMemo(() => {
    const map = new Map<string, number>();
    transactions.filter(t => t.type === "EXPENSE").forEach(t => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return [...map.entries()].map(([name, value]) => ({ name: name.replace(/_/g, " "), value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // ── Herd ──────────────────────────────────────────────────────────────────
  const breedCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of active_) map.set(c.breed, (map.get(c.breed) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [active_]);

  const generated = new Intl.DateTimeFormat("en-ZA", { dateStyle: "long", timeStyle: "short" }).format(new Date());

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-root, #report-root * { visibility: visible; }
          #report-root { position: absolute; inset: 0; padding: 32px; }
          #report-root .hidden { display: block !important; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      {/* Header */}
      <section className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Farm Report</h1>
          <p className="mt-1 text-sm text-gray-400">Generated {generated}</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="no-print inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover)"
        >
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </section>

      <div>
        {/* Section nav — row of tabs */}
        <div className="no-print mb-6 flex w-full gap-1 overflow-x-auto">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors sm:text-sm ${
                active === id ? "bg-(--brand) text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div id="report-root" ref={printRef} className="grid gap-8">

          {/* ── PRODUCTION ── */}
          <section className={active === "production" ? "" : "hidden"}>
            <SectionTitle>Production</SectionTitle>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total milk recorded"
                value={totalMilk.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                unit="L"
                note={`${records.length} shifts`}
                icon={Milk}
                tone="brand"
              />
              <StatCard
                label="Avg daily yield"
                value={avgDaily.toLocaleString("en-ZA", { maximumFractionDigits: 1 })}
                unit="L"
                note="Across all days"
                icon={TrendingUp}
                tone="sky"
              />
              <StatCard
                label="Morning total"
                value={morningTotal.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                unit="L"
                note={`${records.filter(r => r.shift === "MORNING").length} shifts`}
                icon={Sunrise}
                tone="amber"
              />
              <StatCard
                label="Evening total"
                value={eveningTotal.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}
                unit="L"
                note={`${records.filter(r => r.shift === "EVENING").length} shifts`}
                icon={Sunset}
                tone="violet"
              />
            </div>

            <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-gray-800">Daily milk yield — last 30 days</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={milkTrend30} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rptMilk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "none" }}
                    formatter={(v) => [`${Number(v).toLocaleString("en-ZA", { maximumFractionDigits: 1 })} L`, "Total"]} />
                  <Area type="monotone" dataKey="total" stroke="var(--brand)" strokeWidth={2} fill="url(#rptMilk)" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-gray-800">Top 8 producing cows (all-time)</p>
              <div className="grid gap-3">
                {cowTotals.map((c, i) => (
                  <div key={c.tag} className="grid gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">{c.tag}</span>
                      <span className="text-gray-500">{c.total.toLocaleString("en-ZA", { maximumFractionDigits: 0 })} L</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${i === 0 ? "bg-(--brand)" : "bg-(--brand-light)"}`}
                        style={{ width: `${(c.total / (cowTotals[0]?.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── HEALTH ── */}
          <section className={`print-break ${active === "health" ? "" : "hidden"}`}>
            <SectionTitle>Health</SectionTitle>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total animals"
                value={String(cattle.length)}
                note="All statuses"
                icon={PawPrint}
                tone="brand"
              />
              <StatCard
                label="Active herd"
                value={String(active_.length)}
                note="Excl. deceased"
                icon={CheckCircle2}
                tone="sky"
              />
              <StatCard
                label="Needs attention"
                value={String(cattle.filter(c => c.healthStatus === "SICK" || c.healthStatus === "UNDER_TREATMENT").length)}
                note="Sick or in treatment"
                icon={AlertTriangle}
                tone="amber"
              />
              <StatCard
                label="Health records"
                value={String(healthRecords.length)}
                note="Total logged events"
                icon={ClipboardList}
                tone="violet"
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Herd health status</p>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={healthBreakdown} cx="50%" cy="50%" innerRadius={36} outerRadius={54} dataKey="value" strokeWidth={0}>
                        {healthBreakdown.map(d => <Cell key={d.status} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid gap-2 flex-1">
                    {healthBreakdown.map(d => (
                      <div key={d.status} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                        <span className="flex-1 text-gray-500">{d.name}</span>
                        <span className="font-semibold text-gray-800">{d.value}</span>
                        <span className="text-gray-400">({((d.value / cattle.length) * 100).toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Top conditions recorded</p>
                <div className="grid gap-3">
                  {conditionCounts.map((c, i) => (
                    <div key={c.name} className="grid gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-gray-700">{c.name}</span>
                        <span className="text-gray-400">{c.value} cases</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div className="h-full rounded-full bg-amber-400"
                          style={{ width: `${(c.value / (conditionCounts[0]?.value || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-5 py-3">
                <p className="text-sm font-semibold text-gray-800">Recent health events</p>
              </div>
              <table className="w-full border-collapse text-left">
                <thead className="bg-gray-50">
                  <tr>{["DATE","ANIMAL","CONDITION","SEVERITY","VET"].map(h => (
                    <th key={h} className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {recentHealth.map(r => {
                    const cow = cattle.find(c => c.id === r.cattleId);
                    return (
                      <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                        <td className="h-11 px-5 text-xs text-gray-500">{r.date}</td>
                        <td className="h-11 px-5 text-xs font-semibold text-gray-800">{cow?.tagNumber ?? "—"}</td>
                        <td className="h-11 px-5 text-xs text-gray-700">{r.complaint}</td>
                        <td className="h-11 px-5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            r.severity === "HIGH" ? "bg-rose-50 text-rose-600" :
                            r.severity === "MEDIUM" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>{r.severity}</span>
                        </td>
                        <td className="h-11 px-5 text-xs text-gray-500">{r.treatedBy ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── FINANCE ── */}
          <section className={`print-break ${active === "finance" ? "" : "hidden"}`}>
            <SectionTitle>Finance</SectionTitle>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total revenue"
                value={formatMoney(totalRevenue)}
                note={`${transactions.filter(t => t.type === "INCOME").length} income entries`}
                icon={Wallet}
                tone="brand"
              />
              <StatCard
                label="Total costs"
                value={formatMoney(totalCosts)}
                note={`${transactions.filter(t => t.type === "EXPENSE").length} expense entries`}
                icon={Receipt}
                tone="sky"
              />
              <StatCard
                label="Net profit"
                value={`${netProfit >= 0 ? "+" : "−"}${formatMoney(Math.abs(netProfit))}`}
                note={`${margin.toFixed(1)}% margin`}
                icon={netProfit >= 0 ? TrendingUp : TrendingDown}
                tone="amber"
              />
              <StatCard
                label="Monthly payroll"
                value={formatMoney(monthlyPayroll)}
                note={`${workers.filter(w => w.status === "ACTIVE").length} active staff`}
                icon={Users}
                tone="violet"
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <article className="col-span-2 rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-4 text-sm font-semibold text-gray-800">Revenue vs Costs — last 6 months</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyFinance} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "none" }}
                      formatter={(v, name) => [formatMoney(Number(v)), name === "revenue" ? "Revenue" : "Costs"]} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="costs" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-3 flex gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Revenue</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" />Costs</span>
                </div>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Cost breakdown</p>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={costByCategory} cx="50%" cy="50%" innerRadius={42} outerRadius={64} paddingAngle={2} dataKey="value">
                      {costByCategory.map((_, i) => <Cell key={i} fill={COST_COLORS[i % COST_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(v) => [formatMoney(Number(v))]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 grid gap-1.5">
                  {costByCategory.slice(0, 5).map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <span className="h-2 w-2 rounded-full" style={{ background: COST_COLORS[i % COST_COLORS.length] }} />
                        {d.name}
                      </span>
                      <span className="font-semibold text-gray-700">{formatMoney(d.value)}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Milk sales", value: formatMoney(transactions.filter(t => t.category === "MILK_SALES").reduce((s, t) => s + t.amount, 0)) },
                { label: "Animal sales", value: formatMoney(transactions.filter(t => t.category === "ANIMAL_SALE").reduce((s, t) => s + t.amount, 0)) },
                { label: "Feed costs", value: formatMoney(transactions.filter(t => t.category === "FEED").reduce((s, t) => s + t.amount, 0)) },
                { label: "Vet costs", value: formatMoney(transactions.filter(t => t.category === "VETERINARY").reduce((s, t) => s + t.amount, 0)) },
                { label: "Equipment", value: formatMoney(transactions.filter(t => t.category === "EQUIPMENT").reduce((s, t) => s + t.amount, 0)) },
                { label: "Utilities", value: formatMoney(transactions.filter(t => t.category === "UTILITIES").reduce((s, t) => s + t.amount, 0)) },
              ].map(c => (
                <article key={c.label} className="rounded-2xl border border-gray-100 bg-white p-4">
                  <p className="text-xs font-medium text-gray-500">{c.label}</p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{c.value}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── HERD ── */}
          <section className={`print-break ${active === "herd" ? "" : "hidden"}`}>
            <SectionTitle>Herd</SectionTitle>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="Total cattle"
                value={String(cattle.length)}
                note="All records"
                icon={PawPrint}
                tone="brand"
              />
              <StatCard
                label="Active herd"
                value={String(active_.length)}
                note="Excl. deceased"
                icon={CheckCircle2}
                tone="sky"
              />
              <StatCard
                label="Breeds"
                value={String(breedCounts.length)}
                note="Distinct breeds"
                icon={Tag}
                tone="amber"
              />
              <StatCard
                label="Active workers"
                value={String(workers.filter(w => w.status === "ACTIVE").length)}
                note="On payroll"
                icon={Users}
                tone="violet"
              />
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Breed distribution</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={breedCounts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "none" }} />
                    <Bar dataKey="value" fill="var(--brand)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </article>

              <article className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Health status breakdown</p>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={healthBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                        {healthBreakdown.map(d => <Cell key={d.status} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid gap-2 flex-1">
                    {healthBreakdown.map(d => (
                      <div key={d.status} className="flex items-center gap-2 text-xs">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                        <span className="flex-1 text-gray-500">{d.name}</span>
                        <span className="font-semibold text-gray-800">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="border-b border-gray-100 px-5 py-3">
                <p className="text-sm font-semibold text-gray-800">Herd roster</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-120 border-collapse text-left">
                  <thead className="bg-gray-50">
                    <tr>{["TAG","BREED","STATUS","EST. VALUE"].map(h => (
                      <th key={h} className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {cattle.map(c => (
                      <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                        <td className="h-11 px-5 text-xs font-semibold text-gray-800">{c.tagNumber}</td>
                        <td className="h-11 px-5 text-xs text-gray-600">{c.breed}</td>
                        <td className="h-11 px-5">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusTone[c.healthStatus]}`}>
                            {statusText[c.healthStatus]}
                          </span>
                        </td>
                        <td className="h-11 px-5 text-xs font-semibold text-gray-700">{formatMoney(c.estimatedValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-gray-100 pt-4 text-[11px] text-gray-400">
            <span>FarmIQ — Confidential farm report</span>
            <span>{generated}</span>
          </footer>

        </div>
      </div>
    </>
  );
}
