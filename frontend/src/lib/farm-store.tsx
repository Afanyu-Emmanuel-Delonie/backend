"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Cattle, MilkRecord, HealthRecord, FinanceTransaction } from "@/lib/seed-data";
import type { InventoryItem } from "@/lib/inventory-data";
import type { Worker } from "@/lib/workers-data";
import {
  fetchCattle,
  fetchHealthRecords,
  fetchInventory,
  fetchMilkRecords,
  fetchTransactions,
  fetchWorkers,
  createCattle,
  createHealthRecord,
  createInventoryItem,
  createMilkRecord,
  createTransaction,
  createWorker,
} from "@/lib/farm-api";

/** One entry per independently-fetched domain, so one failing endpoint never blanks the rest. */
const SECTIONS = [
  { key: "cattle", label: "Herd" },
  { key: "records", label: "Milk production" },
  { key: "healthRecords", label: "Health records" },
  { key: "inventory", label: "Inventory" },
  { key: "workers", label: "Workers" },
  { key: "transactions", label: "Finance" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

type FarmStore = {
  cattle: Cattle[];
  records: MilkRecord[];
  healthRecords: HealthRecord[];
  inventory: InventoryItem[];
  workers: Worker[];
  transactions: FinanceTransaction[];
  loading: boolean;
  /** Label of each section that failed to load, keyed by section. Empty when everything loaded fine. */
  errors: Partial<Record<SectionKey, string>>;
  sectionLabels: typeof SECTIONS;
  refetch: () => void;
  addCattle: (input: Omit<Cattle, "id">) => Promise<Cattle>;
  addMilkRecord: (input: Omit<MilkRecord, "id" | "cattleTagNumber">) => Promise<MilkRecord>;
  addHealthRecord: (input: Omit<HealthRecord, "id">) => Promise<HealthRecord>;
  addInventoryItem: (input: Omit<InventoryItem, "id">) => Promise<InventoryItem>;
  addTransaction: (input: Omit<FinanceTransaction, "id">) => Promise<FinanceTransaction>;
  addWorker: (input: Omit<Worker, "id">) => Promise<Worker>;
};

const FarmContext = createContext<FarmStore | null>(null);

export function FarmProvider({ children }: { children: ReactNode }) {
  const [cattle, setCattle] = useState<Cattle[]>([]);
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<SectionKey, string>>>({});
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      const [cattleResult, recordsResult, healthResult, inventoryResult, workersResult, transactionsResult] =
        await Promise.allSettled([
          fetchCattle(),
          fetchMilkRecords(),
          fetchHealthRecords(),
          fetchInventory(),
          fetchWorkers(),
          fetchTransactions(),
        ]);
      if (cancelled) return;

      const nextErrors: Partial<Record<SectionKey, string>> = {};

      if (cattleResult.status === "fulfilled") setCattle(cattleResult.value);
      else nextErrors.cattle = cattleResult.reason instanceof Error ? cattleResult.reason.message : "Failed to load";

      if (recordsResult.status === "fulfilled") setRecords(recordsResult.value);
      else nextErrors.records = recordsResult.reason instanceof Error ? recordsResult.reason.message : "Failed to load";

      if (healthResult.status === "fulfilled") setHealthRecords(healthResult.value);
      else nextErrors.healthRecords = healthResult.reason instanceof Error ? healthResult.reason.message : "Failed to load";

      if (inventoryResult.status === "fulfilled") setInventory(inventoryResult.value);
      else nextErrors.inventory = inventoryResult.reason instanceof Error ? inventoryResult.reason.message : "Failed to load";

      if (workersResult.status === "fulfilled") setWorkers(workersResult.value);
      else nextErrors.workers = workersResult.reason instanceof Error ? workersResult.reason.message : "Failed to load";

      if (transactionsResult.status === "fulfilled") setTransactions(transactionsResult.value);
      else nextErrors.transactions = transactionsResult.reason instanceof Error ? transactionsResult.reason.message : "Failed to load";

      setErrors(nextErrors);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const addCattle = useCallback(async (input: Omit<Cattle, "id">) => {
    const created = await createCattle(input);
    setCattle((prev) => [...prev, created]);
    return created;
  }, []);

  const addMilkRecord = useCallback(
    async (input: Omit<MilkRecord, "id" | "cattleTagNumber">) => {
      const created = await createMilkRecord(input);
      setRecords((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const addHealthRecord = useCallback(async (input: Omit<HealthRecord, "id">) => {
    const created = await createHealthRecord(input);
    setHealthRecords((prev) => [...prev, created]);
    return created;
  }, []);

  const addInventoryItem = useCallback(async (input: Omit<InventoryItem, "id">) => {
    const created = await createInventoryItem(input);
    setInventory((prev) => [...prev, created]);
    return created;
  }, []);

  const addTransaction = useCallback(async (input: Omit<FinanceTransaction, "id">) => {
    const created = await createTransaction(input);
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  const addWorker = useCallback(async (input: Omit<Worker, "id">) => {
    const created = await createWorker(input);
    setWorkers((prev) => [...prev, created]);
    return created;
  }, []);

  const value = useMemo<FarmStore>(
    () => ({
      cattle,
      records,
      healthRecords,
      inventory,
      workers,
      transactions,
      loading,
      errors,
      sectionLabels: SECTIONS,
      refetch,
      addCattle,
      addMilkRecord,
      addHealthRecord,
      addInventoryItem,
      addTransaction,
      addWorker,
    }),
    [cattle, records, healthRecords, inventory, workers, transactions, loading, errors, refetch, addCattle, addMilkRecord, addHealthRecord, addInventoryItem, addTransaction, addWorker]
  );

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const ctx = useContext(FarmContext);
  if (!ctx) throw new Error("useFarm must be used within a FarmProvider");
  return ctx;
}
