"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Package,
  Plus,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useFarm } from "@/lib/farm-store";
import { formatMoney } from "@/lib/currency";
import { BrandMark } from "@/components/BrandMark";
import type { EquipmentCondition, InventoryCategory, InventoryItem } from "@/lib/inventory-data";

const PAGE_SIZE = 10;

const CATEGORY_LABEL: Record<InventoryCategory, string> = {
  FEED: "Feed",
  SUPPLIES: "Supplies",
  EQUIPMENT: "Equipment",
};

const CONDITION_LABEL: Record<EquipmentCondition, string> = {
  OPERATIONAL: "Operational",
  NEEDS_REPAIR: "Needs repair",
  OUT_OF_SERVICE: "Out of service",
};

const CONDITION_TONE: Record<EquipmentCondition, string> = {
  OPERATIONAL: "bg-emerald-50 text-emerald-700",
  NEEDS_REPAIR: "bg-amber-50 text-amber-700",
  OUT_OF_SERVICE: "bg-red-50 text-red-600",
};

const CATEGORY_ICON: Record<InventoryCategory, React.ReactNode> = {
  FEED:      <Package className="h-4 w-4" />,
  SUPPLIES:  <Boxes className="h-4 w-4" />,
  EQUIPMENT: <Wrench className="h-4 w-4" />,
};

const CATEGORY_TONE: Record<InventoryCategory, string> = {
  FEED:      "bg-amber-50 text-amber-600",
  SUPPLIES:  "bg-sky-50 text-sky-600",
  EQUIPMENT: "bg-indigo-50 text-indigo-600",
};

const today = () => new Date().toLocaleDateString("en-CA");

function itemValue(item: InventoryItem): number {
  return item.quantity * item.unitCost;
}

function isLowStock(item: InventoryItem): boolean {
  return item.reorderLevel !== undefined && item.quantity <= item.reorderLevel;
}

export default function InventoryPage() {
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

  const { inventory, addInventoryItem } = useFarm();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<InventoryCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const totalValue = inventory.reduce((sum, i) => sum + itemValue(i), 0);
  const lowStockCount = inventory.filter(isLowStock).length;
  const equipmentAttention = inventory.filter(
    (i) => i.category === "EQUIPMENT" && i.condition && i.condition !== "OPERATIONAL"
  ).length;

  const filtered = inventory.filter((i) => {
    if (categoryFilter !== "ALL" && i.category !== categoryFilter) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filterKey = `${search}|${categoryFilter}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (filterKey !== prevKey) { setPrevKey(filterKey); setPage(1); }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers: number[] = [];
  for (let p = Math.max(1, safePage - 2); p <= Math.min(totalPages, safePage + 2); p++) pageNumbers.push(p);

  const hasFilters = search || categoryFilter !== "ALL";

  return (
    <div ref={pageRef}>
      <section className="gs-header mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Inventory</h1>
          <p className="mt-1.5 text-sm text-gray-500">Feed, supplies, and equipment on Greenfields Farm.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-(--brand) px-4 text-sm font-semibold text-white transition-colors hover:bg-(--brand-hover) focus:outline-none focus:ring-2 focus:ring-(--brand-light)"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </section>

      {/* KPI cards */}
      <section className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <article className="gs-card relative overflow-hidden rounded-2xl bg-(--brand) p-5">
          <BrandMark className="pointer-events-none absolute -right-5 -bottom-6 h-28 w-28 text-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-medium text-white/70">Total items</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-white"><Boxes className="h-4 w-4" /></span>
          </div>
          <strong className="relative mt-3 block text-[26px] font-bold tracking-tight text-white">{inventory.length}</strong>
          <p className="relative mt-2 text-xs text-white/70">Feed, supplies &amp; equipment</p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Low stock</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{lowStockCount}</strong>
          <p className="mt-2 text-xs text-gray-500">At or below reorder level</p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Equipment issues</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-500">
              <Wrench className="h-4 w-4" />
            </span>
          </div>
          <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{equipmentAttention}</strong>
          <p className="mt-2 text-xs text-gray-500">Needs repair or out of service</p>
        </article>

        <article className="gs-card rounded-2xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Total value</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-600">
              <Coins className="h-4 w-4" />
            </span>
          </div>
          <strong className="mt-3 block text-[26px] font-bold tracking-tight text-gray-900">{formatMoney(totalValue)}</strong>
          <p className="mt-2 text-xs text-gray-500">Stock + equipment at cost</p>
        </article>
      </section>

      {/* Filters */}
      <section className="gs-section mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search item…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
          />
        </div>

        {(["ALL", "FEED", "SUPPLIES", "EQUIPMENT"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoryFilter(c)}
            className={`h-9 rounded-xl px-3 text-xs font-medium transition-colors ${
              categoryFilter === c
                ? "bg-(--brand) text-white"
                : "border border-gray-200 bg-white text-gray-500 hover:bg-(--brand-light) hover:text-(--brand)"
            }`}
          >
            {c === "ALL" ? "All items" : CATEGORY_LABEL[c]}
          </button>
        ))}

        {hasFilters && (
          <button
            onClick={() => { setCategoryFilter("ALL"); setSearch(""); }}
            className="h-9 rounded-xl px-3 text-xs font-medium text-rose-500 hover:bg-rose-50"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-gray-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
      </section>

      {/* Table */}
      <section className="gs-section overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="h-11 px-5 text-[10px] font-semibold tracking-wide text-gray-400">ITEM</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">CATEGORY</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">QUANTITY</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">STATUS</th>
                <th className="h-11 px-3 text-[10px] font-semibold tracking-wide text-gray-400">UNIT COST</th>
                <th className="h-11 px-5 text-right text-[10px] font-semibold tracking-wide text-gray-400">TOTAL VALUE</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-24 text-center text-sm text-gray-400">
                    {inventory.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Package className="h-6 w-6 text-gray-300" />
                        <p>No inventory items yet.</p>
                        <button
                          type="button"
                          onClick={() => setOpen(true)}
                          className="text-xs font-semibold text-(--brand) hover:text-(--brand-hover)"
                        >
                          Add your first item
                        </button>
                      </div>
                    ) : (
                      "No items match your search."
                    )}
                  </td>
                </tr>
              )}
              {paginated.map((item) => {
                const low = isLowStock(item);
                return (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                    <td className="h-16 px-5">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${CATEGORY_TONE[item.category]}`}>
                          {CATEGORY_ICON[item.category]}
                        </span>
                        <b className="text-xs font-semibold text-gray-800">{item.name}</b>
                      </div>
                    </td>
                    <td className="h-16 px-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${CATEGORY_TONE[item.category]}`}>
                        {CATEGORY_LABEL[item.category]}
                      </span>
                    </td>
                    <td className="h-16 px-3 text-xs text-gray-700">
                      {item.quantity.toLocaleString("en-US")} {item.unit}
                    </td>
                    <td className="h-16 px-3">
                      {item.category === "EQUIPMENT" && item.condition ? (
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${CONDITION_TONE[item.condition]}`}>
                          {CONDITION_LABEL[item.condition]}
                        </span>
                      ) : low ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700">
                          <AlertTriangle className="h-3 w-3" /> Low stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> In stock
                        </span>
                      )}
                    </td>
                    <td className="h-16 px-3 text-xs text-gray-500">
                      {formatMoney(item.unitCost)}/{item.unit}
                    </td>
                    <td className="h-16 px-5 text-right text-xs font-semibold text-(--brand)">
                      {formatMoney(itemValue(item))}
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
              ? "No items"
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

      {open && <AddItemPanel onClose={() => setOpen(false)} onAdd={addInventoryItem} />}
    </div>
  );
}

function AddItemPanel({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: Omit<InventoryItem, "id">) => Promise<InventoryItem>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("FEED");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [reorderLevel, setReorderLevel] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [condition, setCondition] = useState<EquipmentCondition>("OPERATIONAL");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Enter an item name.");
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty < 0) return setError("Enter a valid quantity.");
    const cost = parseFloat(unitCost);
    if (isNaN(cost) || cost < 0) return setError("Enter a valid unit cost.");

    setError("");
    setSaving(true);
    try {
      await onAdd({
        name: name.trim(),
        category,
        quantity: qty,
        unit: unit.trim() || "unit",
        unitCost: cost,
        ...(category === "EQUIPMENT"
          ? { condition, purchaseDate: today() }
          : { reorderLevel: reorderLevel ? parseFloat(reorderLevel) : undefined, lastRestocked: today() }),
      });
      onClose();
    } catch (err) {
      setSaving(false);
      setError(err instanceof Error ? err.message : "Could not save the item. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Add inventory item</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100" aria-label="Close">
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Name</label>
            <input
              type="text"
              placeholder="e.g. Dairy Meal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {(["FEED", "SUPPLIES", "EQUIPMENT"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`h-9 rounded-xl border text-xs font-medium transition-colors ${
                    category === c
                      ? "border-(--brand) bg-green-50 text-(--brand)"
                      : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-gray-600">Quantity</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-gray-600">Unit</label>
              <input
                type="text"
                placeholder="kg, units, L…"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
              />
            </div>
          </div>

          {category === "EQUIPMENT" ? (
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-gray-600">Condition</label>
              <div className="grid gap-2">
                {(["OPERATIONAL", "NEEDS_REPAIR", "OUT_OF_SERVICE"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`h-9 rounded-xl border text-xs font-medium transition-colors ${
                      condition === c
                        ? "border-(--brand) bg-green-50 text-(--brand)"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {CONDITION_LABEL[c]}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <label className="text-xs font-medium text-gray-600">Reorder level <span className="text-gray-400">(optional)</span></label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="e.g. 50"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
              />
            </div>
          )}

          <div className="grid gap-1.5">
            <label className="text-xs font-medium text-gray-600">Unit cost (RWF)</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="e.g. 450"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50"
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
              {saving ? "Saving…" : "Save item"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
