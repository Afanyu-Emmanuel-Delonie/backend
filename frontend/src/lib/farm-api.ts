import { authFetch } from "@/lib/auth-api";
import type {
  Cattle,
  FinanceTransaction,
  HealthRecord,
  HealthStatus,
  MilkRecord,
  Severity,
  Shift,
  TransactionCategory,
  TransactionType,
} from "@/lib/seed-data";
import type { EquipmentCondition, InventoryCategory, InventoryItem } from "@/lib/inventory-data";
import type { EmploymentStatus, Worker, WorkerRole } from "@/lib/workers-data";

// ── Cattle ───────────────────────────────────────────────────────────────────

type CattleResponse = {
  id: number;
  tagNumber: string;
  breed: string;
  dateOfBirth: string;
  healthStatus: HealthStatus;
  estimatedValue: number;
  purchaseDate: string | null;
  purchasePrice: number | null;
  deceasedDate: string | null;
  soldDate: string | null;
  soldPrice: number | null;
};

function fromCattleResponse(r: CattleResponse): Cattle {
  return {
    id: r.id,
    tagNumber: r.tagNumber,
    breed: r.breed,
    dateOfBirth: r.dateOfBirth,
    healthStatus: r.healthStatus,
    estimatedValue: r.estimatedValue,
    purchaseDate: r.purchaseDate ?? undefined,
    purchasePrice: r.purchasePrice ?? undefined,
    deceasedDate: r.deceasedDate ?? undefined,
    soldDate: r.soldDate ?? undefined,
    soldPrice: r.soldPrice ?? undefined,
  };
}

export async function fetchCattle(): Promise<Cattle[]> {
  const rows = await authFetch<CattleResponse[]>("/api/cattle");
  return rows.map(fromCattleResponse);
}

export async function createCattle(input: Omit<Cattle, "id">): Promise<Cattle> {
  const r = await authFetch<CattleResponse>("/api/cattle", { method: "POST", body: JSON.stringify(input) });
  return fromCattleResponse(r);
}

// ── Milk production ──────────────────────────────────────────────────────────

type MilkProductionResponse = {
  id: number;
  cattleId: number;
  cattleTagNumber: string;
  recordDate: string;
  shift: Shift;
  quantityLiters: number;
};

export async function fetchMilkRecords(): Promise<MilkRecord[]> {
  return authFetch<MilkProductionResponse[]>("/api/milk-productions");
}

export async function createMilkRecord(input: Omit<MilkRecord, "id" | "cattleTagNumber">): Promise<MilkRecord> {
  return authFetch<MilkProductionResponse>("/api/milk-productions", { method: "POST", body: JSON.stringify(input) });
}

// ── Veterinary / health records ──────────────────────────────────────────────

type VeterinaryRecordResponse = {
  id: number;
  cattleId: number;
  cattleTagNumber: string;
  date: string;
  complaint: string;
  notes: string | null;
  severity: Severity;
  treatedBy: string;
  cost: number | null;
  followUpDate: string | null;
  resolved: boolean;
};

function fromVeterinaryResponse(r: VeterinaryRecordResponse): HealthRecord {
  return {
    id: r.id,
    cattleId: r.cattleId,
    date: r.date,
    complaint: r.complaint,
    notes: r.notes ?? "",
    severity: r.severity,
    treatedBy: r.treatedBy,
  };
}

export async function fetchHealthRecords(): Promise<HealthRecord[]> {
  const rows = await authFetch<VeterinaryRecordResponse[]>("/api/veterinary-records");
  return rows.map(fromVeterinaryResponse);
}

export async function createHealthRecord(input: Omit<HealthRecord, "id">): Promise<HealthRecord> {
  const r = await authFetch<VeterinaryRecordResponse>("/api/veterinary-records", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return fromVeterinaryResponse(r);
}

// ── Finance ───────────────────────────────────────────────────────────────────

type FinanceTransactionResponse = {
  id: number;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  reference: string | null;
};

function fromFinanceResponse(r: FinanceTransactionResponse): FinanceTransaction {
  return {
    id: r.id,
    date: r.date,
    type: r.type,
    category: r.category,
    description: r.description,
    amount: r.amount,
    reference: r.reference ?? undefined,
  };
}

export async function fetchTransactions(): Promise<FinanceTransaction[]> {
  const rows = await authFetch<FinanceTransactionResponse[]>("/api/finance-transactions");
  return rows.map(fromFinanceResponse);
}

export async function createTransaction(input: Omit<FinanceTransaction, "id">): Promise<FinanceTransaction> {
  const r = await authFetch<FinanceTransactionResponse>("/api/finance-transactions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return fromFinanceResponse(r);
}

// ── Inventory ─────────────────────────────────────────────────────────────────

type InventoryItemResponse = {
  id: number;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorderLevel: number | null;
  unitCost: number;
  lastRestocked: string | null;
  condition: EquipmentCondition | null;
  purchaseDate: string | null;
};

function fromInventoryResponse(r: InventoryItemResponse): InventoryItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    quantity: r.quantity,
    unit: r.unit,
    reorderLevel: r.reorderLevel ?? undefined,
    unitCost: r.unitCost,
    lastRestocked: r.lastRestocked ?? undefined,
    condition: r.condition ?? undefined,
    purchaseDate: r.purchaseDate ?? undefined,
  };
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const rows = await authFetch<InventoryItemResponse[]>("/api/inventory-items");
  return rows.map(fromInventoryResponse);
}

export async function createInventoryItem(input: Omit<InventoryItem, "id">): Promise<InventoryItem> {
  const r = await authFetch<InventoryItemResponse>("/api/inventory-items", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return fromInventoryResponse(r);
}

// ── Workers ───────────────────────────────────────────────────────────────────

type WorkerResponse = {
  id: number;
  name: string;
  role: WorkerRole;
  phone: string;
  startDate: string;
  status: EmploymentStatus;
  monthlySalary: number | null;
};

function fromWorkerResponse(r: WorkerResponse): Worker {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    phone: r.phone,
    startDate: r.startDate,
    status: r.status,
    monthlySalary: r.monthlySalary ?? undefined,
  };
}

export async function fetchWorkers(): Promise<Worker[]> {
  const rows = await authFetch<WorkerResponse[]>("/api/workers");
  return rows.map(fromWorkerResponse);
}

export async function createWorker(input: Omit<Worker, "id">): Promise<Worker> {
  const r = await authFetch<WorkerResponse>("/api/workers", { method: "POST", body: JSON.stringify(input) });
  return fromWorkerResponse(r);
}

export async function updateWorker(id: number, input: Omit<Worker, "id">): Promise<Worker> {
  const r = await authFetch<WorkerResponse>(`/api/workers/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return fromWorkerResponse(r);
}

export async function deleteWorker(id: number): Promise<void> {
  await authFetch<void>(`/api/workers/${id}`, { method: "DELETE" });
}

export async function seedWorkersApi(workers: Omit<Worker, "id">[]): Promise<Worker[]> {
  return Promise.all(workers.map((w) => createWorker(w)));
}

// ── Farm users (owner-only) ───────────────────────────────────────────────────

import type { UserResponse } from "@/lib/auth-api";

export async function fetchFarmUsers(): Promise<UserResponse[]> {
  return authFetch<UserResponse[]>("/api/farm/users");
}

// ── Invites (owner-only) ──────────────────────────────────────────────────────

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED";
export type InviteRole = "WORKER" | "BRANCH";

export type Invite = {
  id: number;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  sentAt: string;
};

export async function fetchInvites(): Promise<Invite[]> {
  return authFetch<Invite[]>("/api/invites");
}

export async function createInvite(input: { email: string; role: InviteRole }): Promise<Invite> {
  return authFetch<Invite>("/api/invites", { method: "POST", body: JSON.stringify(input) });
}

export async function revokeInvite(id: number): Promise<void> {
  await authFetch<void>(`/api/invites/${id}`, { method: "DELETE" });
}
