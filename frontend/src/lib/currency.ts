const CURRENCY = "RWF";

function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `${(value / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 })}K`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/** Formats an amount as Rwandan Francs, abbreviating large values (K/M/B). */
export function formatMoney(value: number): string {
  return `${CURRENCY} ${compact(value)}`;
}
