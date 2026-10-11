"use client";

import { useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  ArrowRight,
  CheckCircle2,
  Droplets,
  HeartPulse,
  PawPrint,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { useFarm } from "@/lib/farm-store";
import { cowColor, statusText, statusTone } from "@/lib/status";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-CA");
}

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

export default function OverviewPage() {
  const { cattle, records } = useFarm();

  const date = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const todayMilk = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA");
    return records
      .filter((r) => r.recordDate === today)
      .reduce((s, r) => s + r.quantityLiters, 0);
  }, [records]);

  const active = cattle.filter((c) => c.healthStatus !== "DECEASED").length;
  const needsCare = cattle.filter(
    (c) => c.healthStatus === "SICK" || c.healthStatus === "UNDER_TREATMENT"
  );

  // 7-day milk trend (daily totals)
  const milkTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = isoDaysAgo(6 - i);
      const total = records
        .filter((r) => r.recordDate === date)
        .reduce((s, r) => s + r.quantityLiters, 0);
      return { date: shortDate(date), total };
    });
  }, [records]);

  // Herd health breakdown for donut
  const healthBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cattle) {
      counts[c.healthStatus] = (counts[c.healthStatus] ?? 0) + 1;
    }
    return [
      { name: "Healthy", value: counts["HEALTHY"] ?? 0, color: "#003d2a" },
      { name: "Recovered", value: counts["RECOVERED"] ?? 0, color: "#00a94f" },
      { name: "Treatment", value: counts["UNDER_TREATMENT"] ?? 0, color: "#f59e0b" },
      { name: "Sick", value: counts["SICK"] ?? 0, color: "#f97316" },
      { name: "Deceased", value: counts["DECEASED"] ?? 0, color: "#d1d5db" },
    ].filter((d) => d.value > 0);
  }, [cattle]);

  // Top 5 cows by total production
  const cowTotals = new Map<number, number>();
  for (const r of records) cowTotals.set(r.cattleId, (cowTotals.get(r.cattleId) ?? 0) + r.quantityLiters);
  const topCows = [...cowTotals.entries()]
    .map(([id, totalLiters]) => {
      const c = cattle.find((c) => c.id === id);
      return { id, totalLiters, tag: c?.tagNumber ?? "—", breed: c?.breed ?? "" };
    })
    .sort((a, b) => b.totalLiters - a.totalLiters)
    .slice(0, 5);

  const maxLiters = topCows[0]?.totalLiters ?? 1;

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gs-header",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        ".gs-card",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.1, delay: 0.2 }
      );
      gsap.fromTo(
        ".gs-section",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.12, delay: 0.4 }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      {/* Header */}
      <section className="gs-header mb-6 flex flex-col gap-1">
        <p className="text-[11px] font-semibold tracking-widest text-gray-400">
          {date.toUpperCase()}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Good morning, Admin
        </h1>
        <p className="text-sm text-gray-500">
          Here&apos;s what to check before you head out today.
        </p>
      </section>

      {/* Stat cards */}
      <section aria-label="Farm summary" className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="gs-card"><StatCard
          label="Active herd"
          value={String(active)}
          unit="animals"
          icon={PawPrint}
          tone="brand"
          note="Currently on the farm"
        /></div>
        <div className="gs-card"><StatCard
          label="Milk today"
          value={todayMilk.toLocaleString("en-ZA", { maximumFractionDigits: 1 })}
          unit="L"
          icon={Droplets}
          tone="sky"
          note="From recorded milking shifts"
        /></div>
        <div className="gs-card"><StatCard
          label="Needs attention"
          value={String(needsCare.length)}
          unit="animals"
          icon={HeartPulse}
          tone="amber"
          note="Sick or under treatment"
        /></div>
      </section>

      {/* Milk production chart */}
      <section className="gs-section mb-4 rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-(--brand-light)" />
              <h2 className="text-sm font-semibold text-gray-900">Milk production — last 7 days</h2>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">Total litres per day across all shifts</p>
          </div>
          <Link href="/production" className="flex items-center gap-1 text-xs font-semibold text-(--brand)">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={milkTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="milkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00563b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00563b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "none" }}
              formatter={(v) => [`${Number(v).toLocaleString("en-ZA", { maximumFractionDigits: 1 })} L`, "Total"]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#00563b"
              strokeWidth={2}
              fill="url(#milkGrad)"
              dot={{ r: 3, fill: "#00563b", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Bottom row: health donut + attention list + top cows */}
      <section className="gs-section mb-4 grid grid-cols-1 gap-3 lg:grid-cols-3">

        {/* Herd health donut */}
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <PawPrint className="h-4 w-4 text-(--brand-light)" />
            <h2 className="text-sm font-semibold text-gray-900">Herd health</h2>
          </div>
          {cattle.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <PawPrint className="h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-400">No animals registered yet.</p>
              <Link href="/herd" className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)">
                Add your first animal
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={110} height={110}>
                <PieChart>
                  <Pie
                    data={healthBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={50}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {healthBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(v, name) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid gap-1.5">
                {healthBreakdown.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-500">{d.name}</span>
                    <span className="ml-auto font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Needs attention */}
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-(--brand-light)" />
              <h2 className="text-sm font-semibold text-gray-900">Needs attention</h2>
            </div>
            <Link href="/health" className="flex items-center gap-1 text-xs font-semibold text-(--brand)">
              View <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {cattle.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <PawPrint className="h-4 w-4" />
              No animals registered yet.
            </div>
          ) : needsCare.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-(--brand-light)" />
              All animals are healthy.
            </div>
          ) : (
            <div className="grid gap-2">
              {needsCare.map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 rounded-xl border border-gray-100 p-2.5">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cowColor(c.id)}`}>
                    <HeartPulse className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-xs font-semibold text-gray-800">{c.tagNumber}</b>
                    <small className="block truncate text-[11px] text-gray-400">{c.breed}</small>
                  </span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium whitespace-nowrap ${statusTone[c.healthStatus]}`}>
                    {statusText[c.healthStatus]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>

        {/* Top producing cows — horizontal bar */}
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-3 flex items-center gap-2">
            <Droplets className="h-4 w-4 text-(--brand-light)" />
            <h2 className="text-sm font-semibold text-gray-900">Top producing cows</h2>
          </div>
          {topCows.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Droplets className="h-4 w-4" />
              No production logged yet.
            </div>
          ) : (
            <div className="grid gap-3">
              {topCows.map((t, i) => (
                <div key={t.id} className="grid gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${cowColor(t.id)}`}>
                        {i + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{t.tag}</span>
                      <span className="text-gray-400">{t.breed}</span>
                    </span>
                    <span className="font-semibold text-gray-700">
                      {t.totalLiters.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}L
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${i === 0 ? "bg-(--brand)" : "bg-(--brand-light)"}`}
                      style={{ width: `${(t.totalLiters / maxLiters) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <footer className="gs-section flex items-center justify-between py-2 text-[11px] text-gray-400">
        <span>© 2026 FarmIQ</span>
      </footer>
    </div>
  );
}
