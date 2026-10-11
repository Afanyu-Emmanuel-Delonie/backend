import type { HealthStatus, Severity } from "@/lib/seed-data";
export type { HealthStatus };

const COW_PALETTES = [
  "bg-sky-50 text-sky-600",
  "bg-violet-50 text-violet-600",
  "bg-teal-50 text-teal-600",
  "bg-indigo-50 text-indigo-600",
  "bg-rose-50 text-rose-500",
  "bg-amber-50 text-amber-600",
] as const;

export function cowColor(id: number): string {
  return COW_PALETTES[id % COW_PALETTES.length];
}

export const statusText: Record<HealthStatus, string> = {
  HEALTHY: "Healthy",
  SICK: "Sick",
  UNDER_TREATMENT: "In treatment",
  RECOVERED: "Recovered",
  DECEASED: "Deceased",
};

export const statusTone: Record<HealthStatus, string> = {
  HEALTHY: "bg-emerald-50 text-emerald-700",
  RECOVERED: "bg-emerald-50 text-emerald-700",
  SICK: "bg-amber-50 text-amber-700",
  UNDER_TREATMENT: "bg-amber-50 text-amber-700",
  DECEASED: "bg-gray-100 text-gray-500",
};

export const severityText: Record<Severity, string> = {
  LOW:    "Low",
  MEDIUM: "Medium",
  HIGH:   "High",
};

export const severityTone: Record<Severity, string> = {
  LOW:    "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH:   "bg-rose-50 text-rose-600",
};

export type AgeStage = "Calf" | "Weaner" | "Heifer" | "Nursing" | "Adult" | "Senior";

export const AGE_STAGE_ORDER: AgeStage[] = ["Calf", "Weaner", "Heifer", "Nursing", "Adult", "Senior"];

export const ageStageTone: Record<AgeStage, string> = {
  Calf:    "bg-pink-50 text-pink-600",
  Weaner:  "bg-orange-50 text-orange-600",
  Heifer:  "bg-violet-50 text-violet-600",
  Nursing: "bg-sky-50 text-sky-600",
  Adult:   "bg-teal-50 text-teal-600",
  Senior:  "bg-gray-100 text-gray-500",
};

export function ageStage(dateOfBirth: string): AgeStage {
  const months = (Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  if (months < 3)  return "Calf";
  if (months < 6)  return "Weaner";
  if (months < 24) return "Heifer";
  if (months < 48) return "Nursing";
  if (months < 96) return "Adult";
  return "Senior";
}

export function ageLabel(dateOfBirth: string): string {
  const totalMonths = Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (totalMonths < 1)  return "< 1 mo";
  if (totalMonths < 12) return `${totalMonths} mo`;
  const yrs = Math.floor(totalMonths / 12);
  const mo  = totalMonths % 12;
  return mo > 0 ? `${yrs}y ${mo}mo` : `${yrs}y`;
}
