export type HealthStatus = "HEALTHY" | "SICK" | "UNDER_TREATMENT" | "RECOVERED" | "DECEASED";
export type Shift = "MORNING" | "EVENING";
export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionCategory =
  | "MILK_SALES"
  | "ANIMAL_SALE"
  | "ANIMAL_PURCHASE"
  | "FEED"
  | "VETERINARY"
  | "LABOR"
  | "EQUIPMENT"
  | "UTILITIES"
  | "OTHER";

export type FinanceTransaction = {
  id: number;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  /** Optional reference (e.g. animal tag, invoice number) */
  reference?: string;
};

export type HealthRecord = {
  id: number;
  cattleId: number;
  date: string;
  complaint: string;
  notes: string;
  severity: Severity;
  treatedBy: string;
};

export type Cattle = {
  id: number;
  tagNumber: string;
  breed: string;
  dateOfBirth: string;
  healthStatus: HealthStatus;
  /** Estimated current market value in Rwandan Francs (RWF). */
  estimatedValue: number;
  /** Set when the animal was bought in rather than born on the farm. */
  purchaseDate?: string;
  purchasePrice?: number;
  /** Set if the animal has died. */
  deceasedDate?: string;
  /** Set if the animal has been sold off the farm. */
  soldDate?: string;
  soldPrice?: number;
};

export type MilkRecord = {
  id: number;
  cattleId: number;
  cattleTagNumber: string;
  recordDate: string;
  shift: Shift;
  quantityLiters: number;
};

function isoMonthsAgo(months: number, day = 15): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return d.toLocaleDateString("en-CA");
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString("en-CA");
}

function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toLocaleDateString("en-CA");
}

export const seedCattle: Cattle[] = [
  // Calves (0–3 months) — born on the farm
  { id: 13, tagNumber: "VQ-1054", breed: "Holstein Friesian", dateOfBirth: monthsAgo(1),  healthStatus: "HEALTHY", estimatedValue: 180_000 },
  { id: 14, tagNumber: "VQ-1055", breed: "Jersey",            dateOfBirth: monthsAgo(2),  healthStatus: "HEALTHY", estimatedValue: 150_000 },
  // Weaners (3–6 months)
  { id: 15, tagNumber: "VQ-1056", breed: "Ayrshire",          dateOfBirth: monthsAgo(4),  healthStatus: "HEALTHY", estimatedValue: 210_000 },
  // Heifers (6–24 months)
  { id: 16, tagNumber: "VQ-1057", breed: "Guernsey",          dateOfBirth: monthsAgo(14), healthStatus: "HEALTHY", estimatedValue: 460_000, purchaseDate: monthsAgo(10), purchasePrice: 380_000 },
  { id: 17, tagNumber: "VQ-1058", breed: "Brown Swiss",       dateOfBirth: monthsAgo(20), healthStatus: "HEALTHY", estimatedValue: 520_000 },
  // Nursing cows (2–4 years)
  { id: 3,  tagNumber: "VQ-1044", breed: "Guernsey",          dateOfBirth: "2022-01-19",  healthStatus: "UNDER_TREATMENT", estimatedValue: 560_000, purchaseDate: "2022-08-10", purchasePrice: 440_000 },
  { id: 7,  tagNumber: "VQ-1048", breed: "Jersey",            dateOfBirth: "2022-04-11",  healthStatus: "SICK", estimatedValue: 380_000 },
  { id: 11, tagNumber: "VQ-1052", breed: "Holstein Friesian", dateOfBirth: "2022-06-30",  healthStatus: "HEALTHY", estimatedValue: 740_000, purchaseDate: "2023-01-15", purchasePrice: 640_000 },
  // Adults (4–8 years)
  { id: 1,  tagNumber: "VQ-1042", breed: "Holstein Friesian", dateOfBirth: "2021-03-14",  healthStatus: "HEALTHY", estimatedValue: 840_000 },
  { id: 5,  tagNumber: "VQ-1046", breed: "Brown Swiss",       dateOfBirth: "2021-09-08",  healthStatus: "RECOVERED", estimatedValue: 700_000, purchaseDate: "2022-02-20", purchasePrice: 600_000 },
  { id: 6,  tagNumber: "VQ-1047", breed: "Holstein Friesian", dateOfBirth: "2020-05-30",  healthStatus: "HEALTHY", estimatedValue: 900_000 },
  { id: 9,  tagNumber: "VQ-1050", breed: "Guernsey",          dateOfBirth: "2021-02-17",  healthStatus: "HEALTHY", estimatedValue: 760_000, purchaseDate: "2021-09-01", purchasePrice: 520_000 },
  { id: 2,  tagNumber: "VQ-1043", breed: "Jersey",            dateOfBirth: "2020-11-02",  healthStatus: "HEALTHY", estimatedValue: 660_000 },
  { id: 10, tagNumber: "VQ-1051", breed: "Ayrshire",          dateOfBirth: "2020-08-26",  healthStatus: "HEALTHY", estimatedValue: 720_000, purchaseDate: "2021-03-10", purchasePrice: 560_000 },
  // Seniors (8+ years)
  { id: 4,  tagNumber: "VQ-1045", breed: "Ayrshire",          dateOfBirth: "2019-07-23",  healthStatus: "HEALTHY", estimatedValue: 600_000 },
  { id: 12, tagNumber: "VQ-1053", breed: "Brown Swiss",       dateOfBirth: "2019-10-14",  healthStatus: "HEALTHY", estimatedValue: 620_000, purchaseDate: "2020-04-01", purchasePrice: 640_000 },
  { id: 8,  tagNumber: "VQ-1049", breed: "Friesian",          dateOfBirth: "2018-12-05",  healthStatus: "DECEASED", estimatedValue: 0, purchaseDate: "2019-05-20", purchasePrice: 580_000, deceasedDate: "2025-11-02" },
];

const BASE_YIELD: Record<string, number> = {
  "Holstein Friesian": 14,
  Jersey: 10,
  Guernsey: 11,
  Ayrshire: 12,
  "Brown Swiss": 13,
  Friesian: 14,
};

const DAYS_OF_HISTORY = 5;
const milkingCattle = seedCattle.filter((c) => c.healthStatus !== "DECEASED" && c.healthStatus !== "SICK");

export const seedHealthRecords: HealthRecord[] = [
  { id: 1,  cattleId: 7,  date: isoDaysAgo(10), complaint: "Loss of appetite",       notes: "Reduced feed intake noticed during morning check. Isolating for observation.", severity: "MEDIUM", treatedBy: "Dr. Mokoena" },
  { id: 2,  cattleId: 7,  date: isoDaysAgo(7),  complaint: "Fever — 39.8°C",          notes: "Temperature elevated. Administered anti-inflammatory. Monitoring closely.",    severity: "HIGH",   treatedBy: "Dr. Mokoena" },
  { id: 3,  cattleId: 7,  date: isoDaysAgo(3),  complaint: "Mild improvement noted",  notes: "Eating small amounts. Temperature down to 38.9°C. Continue treatment.",       severity: "LOW",    treatedBy: "Farm Admin" },
  { id: 4,  cattleId: 3,  date: isoDaysAgo(14), complaint: "Lameness — left foreleg", notes: "Limping observed. Hoof trimmed, wound cleaned and bandaged.",                  severity: "MEDIUM", treatedBy: "Dr. Sithole" },
  { id: 5,  cattleId: 3,  date: isoDaysAgo(8),  complaint: "Wound infection",         notes: "Bandage changed. Signs of infection. Antibiotic course started.",              severity: "HIGH",   treatedBy: "Dr. Sithole" },
  { id: 6,  cattleId: 3,  date: isoDaysAgo(2),  complaint: "Responding to antibiotics",notes: "Swelling reduced. Walking with less difficulty. Continue for 5 more days.",   severity: "LOW",    treatedBy: "Dr. Sithole" },
  { id: 7,  cattleId: 5,  date: isoDaysAgo(20), complaint: "Respiratory distress",    notes: "Coughing and nasal discharge. Moved to isolation pen.",                       severity: "HIGH",   treatedBy: "Dr. Mokoena" },
  { id: 8,  cattleId: 5,  date: isoDaysAgo(12), complaint: "Improving — cleared",     notes: "No more coughing. Nasal discharge resolved. Returned to herd.",               severity: "LOW",    treatedBy: "Dr. Mokoena" },
  { id: 9,  cattleId: 8,  date: "2025-10-15",   complaint: "Severe bloat",            notes: "Acute bloat, unresponsive to treatment. Condition deteriorated rapidly.",      severity: "HIGH",   treatedBy: "Dr. Sithole" },
  { id: 10, cattleId: 8,  date: "2025-11-02",   complaint: "Deceased",               notes: "Animal passed away. Cause: acute ruminal bloat.",                             severity: "HIGH",   treatedBy: "Dr. Sithole" },
  { id: 11, cattleId: 1,  date: isoDaysAgo(30), complaint: "Routine check",           notes: "Annual health check. All vitals normal. Vaccinations up to date.",            severity: "LOW",    treatedBy: "Farm Admin" },
  { id: 12, cattleId: 6,  date: isoDaysAgo(45), complaint: "Mastitis — mild",         notes: "Slight swelling in rear quarter. Topical treatment applied.",                 severity: "MEDIUM", treatedBy: "Dr. Mokoena" },
  { id: 13, cattleId: 6,  date: isoDaysAgo(38), complaint: "Mastitis resolved",       notes: "Swelling gone. Milk production back to normal.",                             severity: "LOW",    treatedBy: "Dr. Mokoena" },
];

export const seedTransactions: FinanceTransaction[] = [
  // ── 6 months ago ──────────────────────────────────────────────────────────
  { id: 1,  date: isoMonthsAgo(5, 3),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 420_000 },
  { id: 2,  date: isoMonthsAgo(5, 10), type: "EXPENSE", category: "FEED",            description: "Dairy meal restock (500 kg)",           amount: 225_000 },
  { id: 3,  date: isoMonthsAgo(5, 14), type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 310_000 },
  { id: 4,  date: isoMonthsAgo(5, 20), type: "EXPENSE", category: "LABOR",           description: "Monthly wages — milkers & herders",     amount: 330_000 },
  { id: 5,  date: isoMonthsAgo(5, 25), type: "EXPENSE", category: "VETERINARY",      description: "Routine vaccinations",                 amount: 85_000 },
  // ── 5 months ago ──────────────────────────────────────────────────────────
  { id: 6,  date: isoMonthsAgo(4, 2),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 455_000 },
  { id: 7,  date: isoMonthsAgo(4, 8),  type: "EXPENSE", category: "FEED",            description: "Maize silage delivery (2 000 kg)",      amount: 240_000 },
  { id: 8,  date: isoMonthsAgo(4, 15), type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 340_000 },
  { id: 9,  date: isoMonthsAgo(4, 18), type: "EXPENSE", category: "LABOR",           description: "Monthly wages",                        amount: 330_000 },
  { id: 10, date: isoMonthsAgo(4, 22), type: "EXPENSE", category: "UTILITIES",       description: "Electricity & water bill",             amount: 55_000 },
  // ── 4 months ago ──────────────────────────────────────────────────────────
  { id: 11, date: isoMonthsAgo(3, 4),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 480_000 },
  { id: 12, date: isoMonthsAgo(3, 9),  type: "EXPENSE", category: "FEED",            description: "Hay bales (60 bales)",                 amount: 210_000 },
  { id: 13, date: isoMonthsAgo(3, 12), type: "INCOME",  category: "ANIMAL_SALE",     description: "Sold heifer — VQ-1040",               amount: 520_000, reference: "VQ-1040" },
  { id: 14, date: isoMonthsAgo(3, 16), type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 360_000 },
  { id: 15, date: isoMonthsAgo(3, 20), type: "EXPENSE", category: "LABOR",           description: "Monthly wages",                        amount: 330_000 },
  { id: 16, date: isoMonthsAgo(3, 25), type: "EXPENSE", category: "VETERINARY",      description: "Antibiotic treatment — VQ-1044",       amount: 45_000,  reference: "VQ-1044" },
  // ── 3 months ago ──────────────────────────────────────────────────────────
  { id: 17, date: isoMonthsAgo(2, 3),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 510_000 },
  { id: 18, date: isoMonthsAgo(2, 7),  type: "EXPENSE", category: "ANIMAL_PURCHASE", description: "Purchased heifer — VQ-1057",           amount: 380_000, reference: "VQ-1057" },
  { id: 19, date: isoMonthsAgo(2, 11), type: "EXPENSE", category: "FEED",            description: "Dairy meal restock (600 kg)",           amount: 270_000 },
  { id: 20, date: isoMonthsAgo(2, 15), type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 390_000 },
  { id: 21, date: isoMonthsAgo(2, 19), type: "EXPENSE", category: "LABOR",           description: "Monthly wages",                        amount: 330_000 },
  { id: 22, date: isoMonthsAgo(2, 24), type: "EXPENSE", category: "EQUIPMENT",       description: "Tractor service & parts",              amount: 120_000 },
  { id: 23, date: isoMonthsAgo(2, 28), type: "EXPENSE", category: "UTILITIES",       description: "Electricity & water bill",             amount: 58_000 },
  // ── 2 months ago ──────────────────────────────────────────────────────────
  { id: 24, date: isoMonthsAgo(1, 2),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 530_000 },
  { id: 25, date: isoMonthsAgo(1, 6),  type: "EXPENSE", category: "FEED",            description: "Mineral lick blocks (20 blocks)",       amount: 160_000 },
  { id: 26, date: isoMonthsAgo(1, 10), type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 410_000 },
  { id: 27, date: isoMonthsAgo(1, 14), type: "EXPENSE", category: "VETERINARY",      description: "Vet consultation — VQ-1048",           amount: 30_000,  reference: "VQ-1048" },
  { id: 28, date: isoMonthsAgo(1, 18), type: "EXPENSE", category: "LABOR",           description: "Monthly wages",                        amount: 330_000 },
  { id: 29, date: isoMonthsAgo(1, 22), type: "INCOME",  category: "ANIMAL_SALE",     description: "Sold bull calf — VQ-1041",            amount: 180_000, reference: "VQ-1041" },
  { id: 30, date: isoMonthsAgo(1, 27), type: "EXPENSE", category: "UTILITIES",       description: "Electricity & water bill",             amount: 61_000 },
  // ── This month ────────────────────────────────────────────────────────────
  { id: 31, date: isoMonthsAgo(0, 2),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — morning batch",          amount: 545_000 },
  { id: 32, date: isoMonthsAgo(0, 5),  type: "EXPENSE", category: "FEED",            description: "Dairy meal restock (550 kg)",           amount: 247_500 },
  { id: 33, date: isoMonthsAgo(0, 8),  type: "INCOME",  category: "MILK_SALES",      description: "Milk sales — evening batch",           amount: 420_000 },
  { id: 34, date: isoMonthsAgo(0, 12), type: "EXPENSE", category: "LABOR",           description: "Monthly wages",                        amount: 330_000 },
  { id: 35, date: isoMonthsAgo(0, 15), type: "EXPENSE", category: "VETERINARY",      description: "Antibiotic course — VQ-1044",          amount: 40_000,  reference: "VQ-1044" },
  { id: 36, date: isoMonthsAgo(0, 18), type: "EXPENSE", category: "UTILITIES",       description: "Electricity & water bill",             amount: 60_000 },
];

export const seedMilkRecords: MilkRecord[] = [];
let nextMilkId = 1;
for (let dayOffset = DAYS_OF_HISTORY - 1; dayOffset >= 0; dayOffset--) {
  const recordDate = isoDaysAgo(dayOffset);
  milkingCattle.forEach((cow, cowIndex) => {
    (["MORNING", "EVENING"] as const).forEach((shift, shiftIndex) => {
      const base = BASE_YIELD[cow.breed] ?? 12;
      const underTreatmentPenalty = cow.healthStatus === "UNDER_TREATMENT" ? 4 : 0;
      const wobble = ((cowIndex * 3 + dayOffset * 2 + shiftIndex) % 5) - 2;
      const shiftBonus = shift === "MORNING" ? 2 : 0;
      const quantityLiters = Math.max(5, base + wobble + shiftBonus - underTreatmentPenalty);
      seedMilkRecords.push({
        id: nextMilkId++,
        cattleId: cow.id,
        cattleTagNumber: cow.tagNumber,
        recordDate,
        shift,
        quantityLiters,
      });
    });
  });
}
