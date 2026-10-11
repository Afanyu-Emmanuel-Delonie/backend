import { authFetch, ApiError, type UserRole } from "@/lib/auth-api";

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED";

export type Invite = {
  id: number;
  email: string;
  role: UserRole;
  status: InviteStatus;
  sentAt: string;
};

export type InvitePublic = {
  id: number;
  farmName: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
};

export function listInvites() {
  return authFetch<Invite[]>("/api/invites");
}

export function createInvite(input: { email: string; role: UserRole }) {
  return authFetch<Invite>("/api/invites", { method: "POST", body: JSON.stringify(input) });
}

export function revokeInvite(id: number) {
  return authFetch<void>(`/api/invites/${id}`, { method: "DELETE" });
}

/** Public — no auth header required; the invitee isn't signed in yet. */
export async function getPublicInvite(id: number): Promise<InvitePublic> {
  const res = await fetch(`/api/invites/${id}/public`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message ?? "This invite link is invalid or has expired.", res.status);
  return data as InvitePublic;
}
