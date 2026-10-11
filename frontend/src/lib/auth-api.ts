export type OtpPurpose = "SIGNUP_VERIFICATION" | "LOGIN_2FA" | "PASSWORD_RESET";

export const FLOW_TO_PURPOSE: Record<string, OtpPurpose> = {
  signup: "SIGNUP_VERIFICATION",
  login: "LOGIN_2FA",
  reset: "PASSWORD_RESET",
};

export type UserRole = "FARM_OWNER" | "WORKER" | "BRANCH";

export type UserResponse = {
  id: number;
  email: string;
  fullName: string;
  farmName: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
};

export type OtpVerifyResponse = {
  token: string | null;
  resetToken: string | null;
  user: UserResponse | null;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Posts to the Spring backend via the Next.js rewrite proxy (see next.config.ts) — same-origin, so no CORS involved. */
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status);
  }
  return data as T;
}

export function register(input: { fullName: string; farmName: string; email: string; phone: string; password: string }) {
  return post<{ message: string }>("/api/auth/register", input);
}

/** Accepting an invite — email/farm/role all come from the invite server-side, not the client. */
export function join(input: { inviteId: number; fullName: string; phone: string; password: string }) {
  return post<{ message: string }>("/api/auth/join", input);
}

export function login(input: { email: string; password: string }) {
  return post<OtpVerifyResponse>("/api/auth/login", input);
}

export function verifyOtp(input: { email: string; code: string; purpose: OtpPurpose }) {
  return post<OtpVerifyResponse>("/api/auth/otp/verify", input);
}

export function resendOtp(input: { email: string; purpose: OtpPurpose }) {
  return post<{ message: string }>("/api/auth/otp/resend", input);
}

export function forgotPassword(input: { email: string }) {
  return post<{ message: string }>("/api/auth/password/forgot", input);
}

export function resetPassword(input: { resetToken: string; newPassword: string }) {
  return post<{ message: string }>("/api/auth/password/reset", input);
}

const TOKEN_KEY = "farmiq_token";
const USER_KEY = "farmiq_user";

export function saveSession(token: string, user: UserResponse) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // localStorage unavailable (private mode, etc.) — session just won't persist across reloads.
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser(): UserResponse | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserResponse) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Authenticated request helper. On a 401 (missing/expired/invalid token), clears
 * the session and hard-redirects to /login — every farm-data call goes through
 * this (via lib/farm-api.ts), so an expired session is handled in one place.
 */
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError("Your session expired. Please sign in again.", 401);
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message ?? "Something went wrong. Please try again.", res.status);
  return data as T;
}

export function updateProfile(input: { fullName: string; farmName: string; phone: string }) {
  return authFetch<UserResponse>("/api/auth/me", { method: "PATCH", body: JSON.stringify(input) });
}

export function changePassword(input: { currentPassword: string; newPassword: string }) {
  return authFetch<{ message: string }>("/api/auth/me/password", { method: "PATCH", body: JSON.stringify(input) });
}

export async function deleteAccount() {
  const token = getToken();
  const res = await fetch("/api/auth/me", {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.message ?? "Something went wrong.", res.status);
  }
}

export function updateStoredUser(user: UserResponse) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch { /* ignore */ }
}
