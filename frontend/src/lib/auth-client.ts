type SessionResponse = { authenticated: boolean; token?: string };

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" });
  if (!res.ok) return { authenticated: false };
  return res.json();
}

/** Client for the password-only admin login (token stored in an httpOnly cookie). */
export const authClient = {
  async getSession() {
    const session = await fetchSession();
    return { data: session.authenticated ? { session: { role: "admin" } } : null };
  },

  async token() {
    const session = await fetchSession();
    return { data: session.authenticated && session.token ? { token: session.token } : null };
  },

  async signIn(password: string): Promise<{ error: string | null }> {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ password }),
    });
    if (res.ok) return { error: null };
    const data = await res.json().catch(() => ({}));
    return { error: data?.error || "Login failed" };
  },

  async signOut() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
  },
};
