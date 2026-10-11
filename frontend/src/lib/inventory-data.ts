export type InventoryCategory = "FEED" | "SUPPLIES" | "EQUIPMENT";
export type EquipmentCondition = "OPERATIONAL" | "NEEDS_REPAIR" | "OUT_OF_SERVICE";

export type InventoryItem = {
  id: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  /** Feed/supplies: restock below this level. Not used for equipment. */
  reorderLevel?: number;
  /** Cost per unit in RWF. */
  unitCost: number;
  lastRestocked?: string;
  condition?: EquipmentCondition;
  purchaseDate?: string;
};

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-CA");
}

export const seedInventory: InventoryItem[] = [
  // Feed
  { id: 1, name: "Dairy Meal (Concentrate)", category: "FEED", quantity: 450, unit: "kg", reorderLevel: 150, unitCost: 450, lastRestocked: isoDaysAgo(4) },
  { id: 2, name: "Maize Silage", category: "FEED", quantity: 3200, unit: "kg", reorderLevel: 1000, unitCost: 120, lastRestocked: isoDaysAgo(9) },
  { id: 3, name: "Hay Bales", category: "FEED", quantity: 85, unit: "bales", reorderLevel: 40, unitCost: 3500, lastRestocked: isoDaysAgo(15) },
  { id: 4, name: "Mineral Lick Blocks", category: "FEED", quantity: 12, unit: "blocks", reorderLevel: 15, unitCost: 8000, lastRestocked: isoDaysAgo(28) },
  { id: 5, name: "Calf Starter Feed", category: "FEED", quantity: 60, unit: "kg", reorderLevel: 80, unitCost: 650, lastRestocked: isoDaysAgo(20) },
  // Supplies
  { id: 6, name: "Veterinary Antibiotics", category: "SUPPLIES", quantity: 8, unit: "packs", reorderLevel: 5, unitCost: 15000, lastRestocked: isoDaysAgo(12) },
  { id: 7, name: "Teat Dip Solution", category: "SUPPLIES", quantity: 20, unit: "L", reorderLevel: 10, unitCost: 4500, lastRestocked: isoDaysAgo(6) },
  { id: 8, name: "Disinfectant", category: "SUPPLIES", quantity: 15, unit: "L", reorderLevel: 10, unitCost: 3200, lastRestocked: isoDaysAgo(18) },
  // Equipment
  { id: 9, name: "Milking Machine (DeLaval)", category: "EQUIPMENT", quantity: 1, unit: "unit", unitCost: 2_500_000, condition: "OPERATIONAL", purchaseDate: "2023-03-10" },
  { id: 10, name: "Water Pump", category: "EQUIPMENT", quantity: 2, unit: "units", unitCost: 350_000, condition: "OPERATIONAL", purchaseDate: "2022-07-22" },
  { id: 11, name: "Tractor (Massey Ferguson)", category: "EQUIPMENT", quantity: 1, unit: "unit", unitCost: 8_500_000, condition: "NEEDS_REPAIR", purchaseDate: "2020-11-05" },
  { id: 12, name: "Backup Generator", category: "EQUIPMENT", quantity: 1, unit: "unit", unitCost: 1_200_000, condition: "OPERATIONAL", purchaseDate: "2021-05-18" },
  { id: 13, name: "Wheelbarrows", category: "EQUIPMENT", quantity: 4, unit: "units", unitCost: 45_000, condition: "OPERATIONAL", purchaseDate: "2023-01-09" },
  { id: 14, name: "Chaff Cutter", category: "EQUIPMENT", quantity: 1, unit: "unit", unitCost: 600_000, condition: "OUT_OF_SERVICE", purchaseDate: "2019-08-14" },
];
