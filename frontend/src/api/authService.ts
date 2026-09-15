export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  // refresh_token is no longer exposed — stored in HttpOnly cookie
}

const USER_KEY = "user";
const ADMIN_SESSION_KEYS = [
  "is_admin_session",
  "admin_session",
  "isAdminSession",
] as const;

async function post<T>(apiEndpoint: string, requestPayload: unknown): Promise<T> {
  const apiResponse = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestPayload),
    credentials: "include",
  });
  const apiResponsePayload = await apiResponse.json().catch(() => null);
  if (!apiResponse.ok) {
    const errorMessage =
      (apiResponsePayload && (apiResponsePayload.detail || apiResponsePayload.message || apiResponsePayload.error)) ||
      `Request failed (${apiResponse.status})`;
    throw new Error(typeof errorMessage === "string" ? errorMessage : "Request failed");
  }
  return apiResponsePayload as T;
}

export const authService = {
  login: (userEmail: string, userPassword: string) =>
    post<AuthResponse>("/system/auth/login", { email: userEmail, password: userPassword }),
  register: (userFullName: string, userEmail: string, userPassword: string, userRole: string) =>
    post<AuthResponse>("/system/auth/register", {
      name: userFullName,
      email: userEmail,
      password: userPassword,
      role: userRole,
    }),
  adminLogin: (adminUsername: string, adminPassword: string) =>
    post<AuthResponse>("/system/auth/admin-login", { username: adminUsername, password: adminPassword }),

  // Kept for backwards compat but no longer stores tokens — tokens are in memory (Zustand) and HttpOnly cookie
  persist(_authToken: string, _refreshToken: string, authenticatedUser: AuthUser) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
    } catch {}
  },
  clear() {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    for (const k of ADMIN_SESSION_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {}
    }
  },
  loadToken: (): string | null => null, // access token is memory-only, not in localStorage
  loadRefreshToken: (): string | null => null, // refresh token is HttpOnly cookie, not accessible to JS
  loadUser(): AuthUser | null {
    try {
      const storedUserJson = localStorage.getItem(USER_KEY);
      return storedUserJson ? (JSON.parse(storedUserJson) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  isAdminSession(): boolean {
    try {
      return ADMIN_SESSION_KEYS.some((adminSessionKey) => localStorage.getItem(adminSessionKey) === "true");
    } catch {
      return false;
    }
  },
  setAdminSession(isAdminSessionEnabled: boolean) {
    for (const adminSessionKey of ADMIN_SESSION_KEYS) {
      try {
        if (isAdminSessionEnabled) localStorage.setItem(adminSessionKey, "true");
        else localStorage.removeItem(adminSessionKey);
      } catch {}
    }
  },

  /** Exchange HttpOnly refresh cookie for a new access token */
  async refresh(): Promise<string | null> {
    try {
      const refreshApiResponse = await fetch("/system/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!refreshApiResponse.ok) return null;
      const refreshResponsePayload: { access_token: string } = await refreshApiResponse.json();
      return refreshResponsePayload.access_token ?? null;
    } catch {
      return null;
    }
  },

  /** Fetch current user via access token (requires valid access token in Authorization) */
  async fetchMe(accessToken: string): Promise<AuthUser | null> {
    try {
      const res = await fetch("/system/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });
      if (!res.ok) return null;
      return (await res.json()) as AuthUser;
    } catch {
      return null;
    }
  },

  /** Logout — clears HttpOnly refresh cookie on backend */
  async logout(): Promise<void> {
    try {
      await fetch("/system/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}
  },
};
