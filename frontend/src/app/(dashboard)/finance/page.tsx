"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import gsap from "gsap";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Coins,
  Droplets,
  Package,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Wallet,
  Wrench,
  X,
  Tag,
  Users,
  Zap,
  ShoppingCart,
  MoreHorizontal,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFarm } from "@/lib/farm-store";
import { formatMoney } from "@/lib/currency";
import { BrandMark } from "@/components/BrandMark";
import type { TransactionCategory, TransactionType, FinanceTransaction } from "@/lib/seed-data";

const PAGE_SIZE = 10;

const CATEGORY_META: Record<
  TransactionCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  MILK_SALES:      { label: "Milk Sales",       icon: <Droplets className="h-3.5 w-3.5" />,     color: "bg-sky-50 text-sky-600" },
  ANIMAL_SALE:     { label: "Animal Sale",       icon: <Tag className="h-3.5 w-3.5" />,          color: "bg-emerald-50 text-emerald-600" },
  ANIMAL_PURCHASE: { label: "Animal Purchase",   icon: <ShoppingCart className="h-3.5 w-3.5" />, color: "bg-violet-50 text-violet-600" },
  FEED:            { label: "Feed",              icon: <Package className="h-3.5 w-3.5" />,      color: "bg-amber-50 text-amber-600" },
  VETERINARY:      { label: "Veterinary",        icon: <Zap className="h-3.5 w-3.5" />,          color: "bg-rose-50 text-rose-500" },
  LABOR:           { label: "Labor / Wages",     icon: <Users className="h-3.5 w-3.5" />,        color: "bg-indigo-50 text-indigo-600" },
  EQUIPMENT:       { label: "Equipment",         icon: <Wrench className="h-3.5 w-3.5" />,       color: "bg-orange-50 text-orange-600" },
  UTILITIES:       { label: "Utilities",         icon: <Zap className="h-3.5 w-3.5" />,          color: "bg-teal-50 text-teal-600" },
  OTHER:           { label: "Other",             icon: <MoreHorizontal className="h-3.5 w-3.5" />, color: "bg-gray-100 text-gray-500" },
};

const INCOME_CATEGORIES: TransactionCategory[] = ["MILK_SALES", "ANIMAL_SALE", "OTHER"];
const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "ANIMAL_PURCHASE", "FEED", "VETERINARY", "LABOR", "EQUIPMENT", "UTILITIES", "OTHER",
];

const ASSET_COLORS = ["#10b981", "#6366f1", "#f59e0b"];

function isoMonthKey(date: string): string {
  return date.slice(0, 7); // "YYYY-MM"
}

function monthKeyLabel(key: string): string {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleString("en-US", { month: "short" });
}

const today = () => new Date().toLocaleDateString("en-CA");

export default function FinancePage() {
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

  const { cattle, inventory, workers, transactions, addTransaction } = useFarm();

  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [catFilter, setCatFilter] = useState<TransactionCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  // ── Asset values ──────────────────────────────────────────────────────────
  const active = cattle.filter((c) => c.healthStatus !== "DECEASED");
  const herdAssetValue = active.reduce((s, c) => s + c.estimatedValue, 0);
  const equipmentValue = inventory
    .filter((i) => i.category === "EQUIPMENT")
    .reduce((s, i) => s + i.unitCost * i.quantity, 0);
  const inventoryStockValue = inventory
    .filter((i) => i.category !== "EQUIPMENT")
    .reduce((s, i) => s + i.unitCost * i.quantity, 0);
  const totalAssets = herdAssetValue + equipmentValue + inventoryStockValue;

  // ── P&L totals ────────────────────────────────────────────────────────────
  const totalRevenue = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalCosts = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // ── Monthly P&L chart (last 6 months) ────────────────────────────────────
  const monthlyChart = useMemo(() => {
    const keys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return keys.map((key) => {
      const month = monthKeyLabel(key);
      const revenue = transactions
        .filter((t) => t.type === "INCOME" && isoMonthKey(t.date) === key)
        .reduce((s, t) => s + t.amount, 0);
      const costs = transactions
        .filter((t) => t.type === "EXPENSE" && isoMonthKey(t.date) === key)
        .reduce((s, t) => s + t.amount, 0);
      return { month, revenue, costs, profit: revenue - costs };
    });
  }, [transactions]);

  // ── Cost breakdown donut ──────────────────────────────────────────────────
  const costBreakdown = useMemo(() => {
    const map = new Map<TransactionCategory, number>();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([cat, value]) => ({ name: CATEGORY_META[cat].label, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // ── Asset donut ───────────────────────────────────────────────────────────
  const assetDonut = [
    { name: "Herd", value: herdAssetValue },
    { name: "Equipment", value: equipmentValue },
    { name: "Inventory", value: inventoryStockValue },
  ];

  // ── Monthly payroll (from workers) ───────────────────────────────────────
  const monthlyPayroll = workers
    .filter((w) => w.status === "ACTIVE" && w.monthlySalary)
    .reduce((s, w) => s + (w.monthlySalary ?? 0), 0);

  // ── Filtered transactions ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
      if (catFilter !== "ALL" && t.category !== catFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !t.description.toLowerCase().includes(q) &&
          !(t.reference ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [transactions, typeFilter, catFilter, search]);

  const filterKey = `${typeFilter}|${catFilter}|${search}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) { setPrevKey(filterKey); setPage(1); }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers: number[] = [];
  for (let p = Math.max(1, safePage - 2); p <= Math.min(totalPages, safePage + 2); p++) pageNumbers.push(p);

  const hasFilters = typeFilter !== "ALL" || catFilter !== "ALL" || search;

  return (
    <div ref={pageRef}>
      {/* Header */}
      <section className="gs-header mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Finance</h1>
          <p className="mt-1.5 text-sm text-gray-500">Revenue, costs, assets, and transactions for Greenfields Farm.</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover)"
        >
          <Plus className="h-4 w-4" /> Add transaction
        </button>
      </section>

      {/* KPI cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-5">
          <BrandMark className="pointer-events-none absolute -right-5 -bottom-6 h-28 w-28 text-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Total revenue</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{formatMoney(totalRevenue)}</strong>
          <p className="relative mt-2 text-xs text-white/70">{transactions.filter((t) => t.type === "INCOME").length} income entries</p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total costs</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-500">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{formatMoney(totalCosts)}</strong>
          <p className="mt-2 text-xs text-gray-500">{transactions.filter((t) => t.type === "EXPENSE").length} expense entries</p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Net profit</span>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <strong className={`mt-3 block text-[26px] font-bold tracking-tight ${netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {netProfit >= 0 ? "+" : "−"}{formatMoney(Math.abs(netProfit))}
          </strong>
          <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            {netProfit >= 0
              ? <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              : <ArrowDownRight className="h-3 w-3 text-red-500" />}
            {profitMargin.toFixed(1)}% margin
          </p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total assets</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{formatMoney(totalAssets)}</strong>
          <p className="mt-2 text-xs text-gray-500">Herd + equipment + stock</p>
        </article>
      </section>

      {/* Charts row */}
      <section className="gs-section mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly P&L bar chart */}
        <div className="col-span-1 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 lg:col-span-2">
          <p className="mb-4 text-sm font-semibold text-gray-800">Revenue vs Costs — last 6 months</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyChart} barGap={4} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "none" }}
                formatter={(v, name) => [formatMoney(Number(v)), name === "revenue" ? "Revenue" : "Costs"]}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Revenue</span>
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" />Costs</span>
          </div>
        </div>

        {/* Asset breakdown donut */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-5">
          <p className="mb-2 text-sm font-semibold text-gray-800">Asset breakdown</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={assetDonut} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                {assetDonut.map((_, i) => <Cell key={i} fill={ASSET_COLORS[i]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "none" }}
                formatter={(v) => [formatMoney(Number(v))]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 space-y-1.5">
            {assetDonut.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-gray-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: ASSET_COLORS[i] }} />
                  {d.name}
                </span>
                <span className="font-semibold text-gray-700">{formatMoney(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary cards row */}
      <section className="gs-section mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Droplets className="h-3.5 w-3.5 text-sky-500" /> Milk revenue
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatMoney(transactions.filter((t) => t.category === "MILK_SALES").reduce((s, t) => s + t.amount, 0))}
          </p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Tag className="h-3.5 w-3.5 text-emerald-500" /> Animal sales
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatMoney(transactions.filter((t) => t.category === "ANIMAL_SALE").reduce((s, t) => s + t.amount, 0))}
          </p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Users className="h-3.5 w-3.5 text-indigo-500" /> Monthly payroll
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">{formatMoney(monthlyPayroll)}</p>
          <p className="mt-0.5 text-[10px] text-gray-400">{workers.filter((w) => w.status === "ACTIVE" && w.monthlySalary).length} active staff</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Package className="h-3.5 w-3.5 text-amber-500" /> Feed costs
          </div>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatMoney(transactions.filter((t) => t.category === "FEED").reduce((s, t) => s + t.amount, 0))}
          </p>
        </article>
      </section>

      {/* Transaction ledger */}
      <section className="gs-section mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search description or ref…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
          />
        </div>

        {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={`h-9 rounded-xl px-3 text-xs font-medium transition-colors ${
              typeFilter === t
                ? "bg-(--brand) text-white"
                : "border border-gray-200 bg-white text-gray-500 hover:bg-(--brand-light) hover:text-(--brand)"
            }`}
          >
            {t === "ALL" ? "All types" : t === "INCOME" ? "Income" : "Expenses"}
          </button>
        ))}

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as TransactionCategory | "ALL")}
          className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-600 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
        >
          <option value="ALL">All categories</option>
          {(Object.keys(CATEGORY_META) as TransactionCategory[]).map((c) => (
            <option key={c} value={c}>{CATEGORY_META[c].label}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setTypeFilter("ALL"); setCatFilter("ALL"); setSearch(""); }}
            className="h-9 rounded-xl px-3 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? "s" : ""}</span>
      </section>

      <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="h-11 px-5 text-[10px] font-semibold tracking-wide text-gray-400">DATE</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">CATEGORY</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">DESCRIPTION</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">REF</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">TYPE</th>
                <th className="h-11 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-24 text-center text-sm text-gray-400">
                    {transactions.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Wallet className="h-6 w-6 text-gray-300" />
                        <p>No transactions logged yet.</p>
                        <button
                          type="button"
                          onClick={() => setAddOpen(true)}
                          className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)"
                        >
                          Add your first transaction
                        </button>
                      </div>
                    ) : (
                      "No transactions match your filters."
                    )}
                  </td>
                </tr>
              )}
              {paginated.map((t) => {
                const meta = CATEGORY_META[t.category];
                return (
                  <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="h-14 px-5 text-xs text-gray-500 whitespace-nowrap">{t.date}</td>
                    <td className="h-14 px-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${meta.color}`}>
                        {meta.icon}{meta.label}
                      </span>
                    </td>
                    <td className="h-14 px-3 text-xs text-gray-700 max-w-[220px] truncate">{t.description}</td>
                    <td className="h-14 px-3 text-xs text-gray-400">{t.reference ?? <span className="text-gray-200">—</span>}</td>
                    <td className="h-14 px-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                        {t.type === "INCOME"
                          ? <ArrowUpRight className="h-3 w-3" />
                          : <ArrowDownRight className="h-3 w-3" />}
                        {t.type === "INCOME" ? "Income" : "Expense"}
                      </span>
                    </td>
                    <td className={`h-14 px-5 text-right text-xs font-bold ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-500"}`}>
                      {t.type === "INCOME" ? "+" : "−"}{formatMoney(t.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-400">
            {filtered.length === 0
              ? "No transactions"
              : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
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
                  p === safePage ? "bg-(--brand) text-white" : "text-gray-500 hover:bg-(--brand-light) hover:text-(--brand)"
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
              className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {addOpen && <AddTransactionPanel onClose={() => setAddOpen(false)} onAdd={addTransaction} />}
    </div>
  );
}

function AddTransactionPanel({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: Omit<FinanceTransaction, "id">) => Promise<FinanceTransaction>;
}) {
  const [type, setType] = useState<TransactionType>("INCOME");
  const [category, setCategory] = useState<TransactionCategory>("MILK_SALES");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // reset category when type changes
  useEffect(() => {
    setCategory(type === "INCOME" ? "MILK_SALES" : "FEED");
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return setError("Enter a description.");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return setError("Enter a valid amount.");
    if (!date) return setError("Pick a date.");
    setError("");
    setSaving(true);
    try {
      await onAdd({ type, category, description: description.trim(), amount: amt, date, reference: reference.trim() || undefined });
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not save the transaction. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Add transaction</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="Close">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          {/* Type toggle */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                    type === t
                      ? t === "INCOME"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-rose-400 bg-rose-50 text-rose-600"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{CATEGORY_META[c].label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Description</label>
            <input
              type="text"
              placeholder="e.g. Milk sales — morning batch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>

          {/* Amount */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Amount (RWF)</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 450000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>

          {/* Date */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={date}
              max={today()}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
            />
          </div>

          {/* Reference (optional) */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Reference <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. VQ-1042, INV-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50"
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
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
