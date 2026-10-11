"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  AlertCircle,
  Camera,
  Check,
  Copy,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Send,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  ApiError,
  changePassword,
  clearSession,
  deleteAccount,
  getStoredUser,
  updateProfile,
  updateStoredUser,
  type UserRole,
  type UserResponse,
} from "@/lib/auth-api";
import { createInvite, listInvites, revokeInvite, type Invite } from "@/lib/invite-api";

type InviteRole = Extract<UserRole, "WORKER" | "BRANCH">;

function initials(name: string) {
  const parts = name.trim().split(" ");
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".gs-header", { y: -16, opacity: 0, duration: 0.45 })
        .from(".gs-section", { y: 20, opacity: 0, duration: 0.4, stagger: 0.12 }, "-=0.2");
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const [storedUser, setStoredUser] = useState<UserResponse | null>(null);
  useEffect(() => { setStoredUser(getStoredUser()); }, []);

  // Profile form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  useEffect(() => {
    if (!storedUser) return;
    setName(storedUser.fullName);
    setEmail(storedUser.email);
    setPhone(storedUser.phone ?? "");
  }, [storedUser]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setProfileError("Full name is required.");
    setProfileError("");
    setProfileLoading(true);
    try {
      const updated = await updateProfile({ fullName: name.trim(), farmName: storedUser?.farmName ?? "", phone: phone.trim() });
      updateStoredUser(updated);
      setStoredUser(updated);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw) return setPwError("Enter your current password.");
    if (newPw.length < 8) return setPwError("New password must be at least 8 characters.");
    if (newPw !== confirmPw) return setPwError("Passwords do not match.");
    setPwError("");
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setPwLoading(false);
    }
  }

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteAccount();
      clearSession();
      router.push("/register");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account.");
      setDeleteLoading(false);
    }
  }

  // Invite panel
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("WORKER");
  const [inviteError, setInviteError] = useState("");
  const [inviteSaving, setInviteSaving] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    listInvites()
      .then(setInvites)
      .catch(() => { /* non-fatal — the panel just shows empty */ })
      .finally(() => setInvitesLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) return setInviteError("Enter a valid email address.");
    setInviteError("");
    setInviteSaving(true);
    try {
      const created = await createInvite({ email: inviteEmail.trim(), role: inviteRole });
      setInvites((prev) => [created, ...prev]);
      setInviteEmail("");
      setInviteOpen(false);
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Could not send the invite. Please try again.");
    } finally {
      setInviteSaving(false);
    }
  }

  async function handleRevoke(id: number) {
    const prev = invites;
    setInvites((p) => p.filter((i) => i.id !== id));
    try {
      await revokeInvite(id);
    } catch {
      setInvites(prev); // restore on failure
    }
  }

  function handleCopyLink(id: number) {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div ref={pageRef}>
      <section className="gs-header mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile & access</h1>
        <p className="mt-1.5 text-sm text-gray-500">Manage your account and invite team members.</p>
      </section>

      <div className="gs-section grid gap-4 lg:grid-cols-3">

        {/* Left col */}
        <div className="flex flex-col gap-4 lg:col-span-2">

          {/* Profile card */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-6 flex items-center gap-5">
              <div className="relative shrink-0">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-(--brand) to-(--brand-light) p-[3px] shadow-lg">
                  <span className="grid h-full w-full place-items-center rounded-full bg-(--brand) text-2xl font-bold tracking-tight text-white">
                    {initials(name || storedUser?.fullName || "?")}
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gray-800 text-white shadow-md transition-colors hover:bg-(--brand)"
                  title="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">{name || storedUser?.fullName || "—"}</p>
                <p className="mt-0.5 text-xs text-gray-400">{storedUser?.role ?? "Farm Owner"} · {storedUser?.farmName ?? "Your Farm"}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-(--brand)">
                  <span className="h-1.5 w-1.5 rounded-full bg-(--brand-light)" /> Active
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Full name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                    <input type="email" value={email} disabled
                      className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-400 outline-none cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Phone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
              </div>
              {profileError && (
                <p className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {profileError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={profileLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
                  {profileLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : profileSaved ? <Check className="h-4 w-4" /> : null}
                  {profileLoading ? "Saving…" : profileSaved ? "Saved" : "Save changes"}
                </button>
                {profileSaved && <span className="text-xs text-gray-400">Profile updated</span>}
              </div>
            </form>
          </section>

          {/* Password card */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-(--brand-light)" />
              <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
            </div>
            <form onSubmit={handleSavePassword} className="grid gap-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Current password</label>
                <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••"
                  className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">New password</label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters"
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium text-gray-600">Confirm new password</label>
                  <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat password"
                    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
                </div>
              </div>
              {pwError && (
                <p className="flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {pwError}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button type="submit" disabled={pwLoading}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-(--brand) px-5 text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:opacity-60">
                  {pwLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : pwSaved ? <Check className="h-4 w-4" /> : null}
                  {pwLoading ? "Updating…" : pwSaved ? "Updated" : "Update password"}
                </button>
                {pwSaved && <span className="text-xs text-gray-400">Password changed</span>}
              </div>
            </form>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-rose-100 bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-rose-600">Danger zone</h2>
            </div>
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
              <div>
                <p className="text-xs font-semibold text-gray-800">Sign out</p>
                <p className="mt-0.5 text-[11px] text-gray-400">You will be returned to the login screen.</p>
              </div>
              <button type="button" onClick={() => { clearSession(); router.push("/login"); }}
                className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            </div>
            <div className="rounded-xl border border-rose-100 p-4">
              <p className="text-xs font-semibold text-gray-800">Delete account</p>
              <p className="mt-0.5 mb-3 text-[11px] text-gray-400">Permanently deletes your account and all data. Type <strong>DELETE</strong> to confirm.</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Type DELETE to confirm" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="h-9 flex-1 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-50" />
                <button type="button" onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETE" || deleteLoading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed">
                  {deleteLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete
                </button>
              </div>
              {deleteError && <p className="mt-2 text-xs text-rose-600">{deleteError}</p>}
            </div>
          </section>
        </div>

        {/* Right col — team access */}
        <div className="flex flex-col gap-4">
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-(--brand-light)" />
                <h2 className="text-sm font-semibold text-gray-900">Team invites</h2>
              </div>
              <button type="button" onClick={() => setInviteOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-(--brand) px-3 text-xs font-semibold text-white hover:bg-(--brand-hover)">
                <Plus className="h-3.5 w-3.5" /> Invite
              </button>
            </div>
            {invitesLoading ? (
              <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-gray-300" /></div>
            ) : invites.length === 0 ? (
              <p className="text-xs text-gray-400">No invites sent yet.</p>
            ) : (
              <ul className="grid gap-2">
                {invites.map((inv) => (
                  <li key={inv.id} className="rounded-xl border border-gray-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-800">{inv.email}</p>
                        <p className="mt-0.5 text-[11px] text-gray-400">{inv.role === "BRANCH" ? "Branch" : "Worker"} · {inv.sentAt.slice(0, 10)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        inv.status === "PENDING" ? "bg-amber-50 text-amber-700"
                          : inv.status === "ACCEPTED" ? "bg-green-50 text-(--brand)"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {inv.status === "PENDING" ? "Pending" : inv.status === "ACCEPTED" ? "Joined" : "Revoked"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {inv.status === "PENDING" && (
                        <button type="button" onClick={() => handleCopyLink(inv.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-(--brand)">
                          {copiedId === inv.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedId === inv.id ? "Copied" : "Copy link"}
                        </button>
                      )}
                      {inv.status === "PENDING" && (
                        <button type="button" onClick={() => handleRevoke(inv.id)}
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-rose-500">
                          <X className="h-3 w-3" /> Revoke
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Access permissions</h2>
            <div className="grid gap-3">
              {(["WORKER", "BRANCH"] as InviteRole[]).map((r) => (
                <div key={r}>
                  <p className="text-xs font-semibold text-gray-700">{r === "WORKER" ? "Worker" : "Branch"}</p>
                  <p className="mb-1.5 text-[11px] text-gray-400">{r === "WORKER" ? "Individual team member" : "Another farm location"}</p>
                  <ul className="grid gap-1">
                    {(["Overview", "Herd", "Production", "Health", "Inventory"] as const).map((m) => (
                      <li key={m} className="flex items-center gap-2 text-[11px] text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-(--brand-light)" />{m}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setInviteOpen(false)} />
          <aside className="relative z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-(--brand-light)" />
                <h2 className="text-sm font-semibold text-gray-900">Invite team member</h2>
              </div>
              <button onClick={() => setInviteOpen(false)} className="rounded-lg p-1 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
                  <input type="email" autoFocus placeholder="e.g. alice@greenfields.rw" value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-(--brand-light) focus:ring-2 focus:ring-green-50" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-gray-600">Account type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["WORKER", "BRANCH"] as InviteRole[]).map((r) => (
                    <button key={r} type="button" onClick={() => setInviteRole(r)}
                      className={`flex flex-col gap-0.5 rounded-xl border p-3 text-left transition-colors ${
                        inviteRole === r ? "border-(--brand) bg-green-50" : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}>
                      <span className={`text-xs font-semibold ${inviteRole === r ? "text-(--brand)" : "text-gray-700"}`}>
                        {r === "WORKER" ? "Worker" : "Branch"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {r === "WORKER" ? "Individual team member" : "Another farm location"}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">Both types can access Overview, Herd, Production, Health, and Inventory. Workers and Finance are hidden.</p>
              </div>
              {inviteError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{inviteError}</p>}
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setInviteOpen(false)}
                  className="h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={inviteSaving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-(--brand) text-sm font-semibold text-white hover:bg-(--brand-hover) disabled:cursor-not-allowed disabled:opacity-60">
                  {inviteSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {inviteSaving ? "Sending…" : "Send invite"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
