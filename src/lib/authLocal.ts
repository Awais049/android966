export type LocalUser = {
  id: string;
  email: string;
  role: "admin" | "user";
  fullName?: string;
};

const SESSION_KEY = "a9_local_user_session";
const ADMIN_PASSWORD_KEY = "a9_admin_secure_password";

export const DEFAULT_ADMIN_EMAIL = "admin@android966.com";
export const DEFAULT_ADMIN_PASSWORD = "A966#SecureAdmin!2026";

export function getLocalUserSession(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function setLocalUserSession(user: LocalUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("a9_auth_change"));
}

export function clearLocalUserSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("a9_auth_change"));
}

export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  try {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
    return stored || DEFAULT_ADMIN_PASSWORD;
  } catch {
    return DEFAULT_ADMIN_PASSWORD;
  }
}

export function setAdminPassword(newPassword: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
}

export function verifyAdminCredentials(email: string, pass: string): boolean {
  const normEmail = email.trim().toLowerCase();
  if (normEmail !== DEFAULT_ADMIN_EMAIL.toLowerCase()) {
    return false;
  }
  const expectedPassword = getAdminPassword();
  return pass === expectedPassword;
}
