import { BrandMark } from "@/components/BrandMark";

const TONE_CLASSES = {
  brand: "bg-(--brand) text-white",
  sky: "bg-white",
  amber: "bg-white",
  violet: "bg-white",
} as const;

const ICON_CLASSES = {
  brand: "bg-white/10 text-white",
  sky: "bg-green-50 text-(--brand)",
  amber: "bg-green-50 text-(--brand)",
  violet: "bg-green-50 text-(--brand)",
} as const;

const DOT_CLASSES = {
  brand: "bg-white/40",
  sky: "bg-(--brand-light)",
  amber: "bg-(--brand-light)",
  violet: "bg-(--brand-light)",
} as const;

const NOTE_CLASSES = {
  brand: "text-green-200",
  sky: "text-gray-400",
  amber: "text-gray-400",
  violet: "text-gray-400",
} as const;

const VALUE_CLASSES = {
  brand: "text-white",
  sky: "text-gray-900",
  amber: "text-gray-900",
  violet: "text-gray-900",
} as const;

const LABEL_CLASSES = {
  brand: "text-green-200",
  sky: "text-gray-500",
  amber: "text-gray-500",
  violet: "text-gray-500",
} as const;

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone,
  note,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: keyof typeof TONE_CLASSES;
  note: string;
}) {
  const isBrand = tone === "brand";
  return (
    <article
      className={`relative overflow-hidden rounded-2xl p-5 ${TONE_CLASSES[tone]} ${isBrand ? "" : "border border-gray-100"}`}
    >
      {isBrand && <BrandMark className="pointer-events-none absolute -right-5 -bottom-6 h-28 w-28 text-white/10" />}
      <div className="relative flex items-center justify-between">
        <span className={`text-xs font-medium ${LABEL_CLASSES[tone]}`}>{label}</span>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${ICON_CLASSES[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <strong className={`relative mt-3 block text-[26px] font-bold tracking-tight ${VALUE_CLASSES[tone]}`}>
        {value}
        {unit && <small className={`ml-1 text-xs font-medium ${isBrand ? "text-green-200" : "text-gray-400"}`}>{unit}</small>}
      </strong>
      <p className={`relative mt-2 flex items-center gap-1.5 text-xs ${NOTE_CLASSES[tone]}`}>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSES[tone]}`} />
        {note}
      </p>
    </article>
  );
}
