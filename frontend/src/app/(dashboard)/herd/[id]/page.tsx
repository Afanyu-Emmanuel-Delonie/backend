"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Banknote, Droplets, PawPrint, Skull, Sparkles, Stethoscope } from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { ageLabel, ageStage, ageStageTone, cowColor, statusText, statusTone } from "@/lib/status";
import { formatMoney } from "@/lib/currency";

const STATUS_DOT: Record<string, string> = {
  HEALTHY: "bg-(--brand-light)",
  RECOVERED: "bg-(--brand-light)",
  UNDER_TREATMENT: "bg-amber-500",
  SICK: "bg-red-500",
  DECEASED: "bg-gray-400",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${iso}T00:00:00`));
}

type LifecycleEvent = {
  date: string;
  title: string;
  description?: string;
  icon: typeof PawPrint;
  tone: string;
};

const SEVERITY_TONE: Record<string, string> = {
  LOW: "bg-sky-50 text-sky-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH: "bg-red-50 text-red-600",
};

export default function AnimalHistoryPage() {
  const params = useParams<{ id: string }>();
  const { cattle, records, healthRecords } = useFarm();
  const cow = cattle.find((c) => String(c.id) === params.id);

  if (!cow) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-sm text-gray-500">We couldn&apos;t find that animal.</p>
        <Link href="/herd" className="text-xs font-semibold text-(--brand)">← Back to herd</Link>
      </div>
    );
  }

  const stage = ageStage(cow.dateOfBirth);
  const cowRecords = records.filter((r) => r.cattleId === cow.id).sort((a, b) => b.recordDate.localeCompare(a.recordDate));
  const lifetimeMilk = cowRecords.reduce((sum, r) => sum + r.quantityLiters, 0);
  const cowHealthRecords = healthRecords.filter((h) => h.cattleId === cow.id).sort((a, b) => b.date.localeCompare(a.date));

  const events: LifecycleEvent[] = [
    { date: cow.dateOfBirth, title: "Born", description: cow.breed, icon: Sparkles, tone: "bg-sky-50 text-sky-600" },
  ];
  if (cow.purchaseDate && cow.purchasePrice) {
    events.push({ date: cow.purchaseDate, title: "Purchased", description: formatMoney(cow.purchasePrice), icon: Banknote, tone: "bg-green-50 text-(--brand)" });
  }
  for (const h of cowHealthRecords) {
    events.push({
      date: h.date,
      title: h.complaint,
      description: `${h.notes} — ${h.treatedBy}`,
      icon: Stethoscope,
      tone: SEVERITY_TONE[h.severity] ?? "bg-gray-100 text-gray-500",
    });
  }
  if (cowHealthRecords.length === 0 && cow.healthStatus !== "DECEASED") {
    events.push({
      date: new Date().toLocaleDateString("en-CA"),
      title: `Current status: ${statusText[cow.healthStatus]}`,
      icon: PawPrint,
      tone: "bg-violet-50 text-violet-600",
    });
  }
  const hasDeceasedRecord = cowHealthRecords.some((h) => h.complaint.toLowerCase() === "deceased");
  if (cow.deceasedDate && !hasDeceasedRecord) {
    events.push({ date: cow.deceasedDate, title: "Deceased", icon: Skull, tone: "bg-gray-100 text-gray-500" });
  }
  if (cow.soldDate && cow.soldPrice) {
    events.push({ date: cow.soldDate, title: "Sold", description: formatMoney(cow.soldPrice), icon: Banknote, tone: "bg-amber-50 text-amber-600" });
  }
  events.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <Link href="/herd" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to herd
      </Link>

      <section className="mb-6 flex flex-wrap items-center gap-4">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${cowColor(cow.id)}`}>
          <span className="text-base font-bold">{cow.tagNumber.slice(-2)}</span>
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{cow.tagNumber}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {cow.breed} · {ageLabel(cow.dateOfBirth)} ·{" "}
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${ageStageTone[stage]}`}>{stage}</span>
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusTone[cow.healthStatus]}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[cow.healthStatus]}`} />
          {statusText[cow.healthStatus]}
        </span>
      </section>

      {/* Stat cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Age</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{ageLabel(cow.dateOfBirth)}</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Acquisition cost</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{cow.purchasePrice ? formatMoney(cow.purchasePrice) : "Born on farm"}</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Estimated value</p>
          <p className="mt-1 text-xl font-bold text-(--brand)">{formatMoney(cow.estimatedValue)}</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-[11px] font-medium text-gray-400">Lifetime milk</p>
          <p className="mt-1 text-xl font-bold text-sky-600">
            {lifetimeMilk.toLocaleString("en-ZA", { maximumFractionDigits: 1 })} <small className="text-xs font-medium text-gray-400">L</small>
          </p>
        </article>
      </section>

      <section className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Valuation */}
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Valuation</h2>
          <div className="grid gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Acquired</span>
              <span className="font-semibold text-gray-800">
                {cow.purchaseDate ? `Purchased · ${fmtDate(cow.purchaseDate)}` : `Born on farm · ${fmtDate(cow.dateOfBirth)}`}
              </span>
            </div>
            {cow.purchasePrice && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Purchase price</span>
                <span className="font-semibold text-gray-800">{formatMoney(cow.purchasePrice)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Current estimated value</span>
              <span className="font-semibold text-(--brand)">{formatMoney(cow.estimatedValue)}</span>
            </div>
            {cow.soldPrice ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Sold price</span>
                <span className="font-semibold text-amber-700">{formatMoney(cow.soldPrice)} · {cow.soldDate && fmtDate(cow.soldDate)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Sold</span>
                <span className="font-medium text-gray-400">{cow.healthStatus === "DECEASED" ? "Not sold" : "Still on the farm"}</span>
              </div>
            )}
          </div>
        </article>

        {/* Lifecycle timeline */}
        <article className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Life cycle</h2>
          <div className="grid gap-4">
            {events.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${e.tone}`}>
                  <e.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <b className="truncate text-xs font-semibold text-gray-800">{e.title}</b>
                    <span className="shrink-0 text-[11px] text-gray-400">{fmtDate(e.date)}</span>
                  </div>
                  {e.description && <p className="mt-0.5 text-[11px] text-gray-500">{e.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Milk production history */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex items-center gap-2 px-5 py-4">
          <Droplets className="h-4 w-4 text-sky-500" />
          <h2 className="text-sm font-semibold text-gray-900">Milk production history</h2>
        </div>
        {cowRecords.length === 0 ? (
          <p className="pb-6 text-center text-sm text-gray-400">No milking records for this animal yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 border-collapse text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="h-9 px-5 text-[10px] font-semibold tracking-wide text-gray-400">DATE</th>
                  <th className="h-9 px-3 text-[10px] font-semibold tracking-wide text-gray-400">SHIFT</th>
                  <th className="h-9 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">QUANTITY</th>
                </tr>
              </thead>
              <tbody>
                {cowRecords.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100">
                    <td className="h-12 px-5 text-xs text-gray-500">{fmtDate(r.recordDate)}</td>
                    <td className="h-12 px-3">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-medium ${r.shift === "MORNING" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-violet-700"}`}>
                        {r.shift === "MORNING" ? "Morning" : "Evening"}
                      </span>
                    </td>
                    <td className="h-12 px-5 text-right text-xs font-semibold text-gray-800">
                      {r.quantityLiters.toLocaleString("en-ZA", { maximumFractionDigits: 1 })} <small className="font-normal text-gray-400">L</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
