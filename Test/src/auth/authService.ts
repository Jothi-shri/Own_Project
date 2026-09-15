export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
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

  persist(authToken: string, refreshToken: string, authenticatedUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    for (const k of ADMIN_SESSION_KEYS) localStorage.removeItem(k);
  },
  loadToken: () => localStorage.getItem(TOKEN_KEY),
  loadRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  loadUser(): AuthUser | null {
    try {
      const storedUserJson = localStorage.getItem(USER_KEY);
      return storedUserJson ? (JSON.parse(storedUserJson) as AuthUser) : null;
    } catch {
      return null;
    }
  },
  isAdminSession(): boolean {
    return ADMIN_SESSION_KEYS.some((adminSessionKey) => localStorage.getItem(adminSessionKey) === "true");
  },
  setAdminSession(isAdminSessionEnabled: boolean) {
    for (const adminSessionKey of ADMIN_SESSION_KEYS) {
      if (isAdminSessionEnabled) localStorage.setItem(adminSessionKey, "true");
      else localStorage.removeItem(adminSessionKey);
    }
  },

  /** Exchange a refresh_token for a new access_token via the backend. */
  async refresh(): Promise<string | null> {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) return null;
    try {
      const refreshApiResponse = await fetch("/system/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });
      if (!refreshApiResponse.ok) return null;
      const refreshResponsePayload: { access_token: string } = await refreshApiResponse.json();
      localStorage.setItem(TOKEN_KEY, refreshResponsePayload.access_token);
      return refreshResponsePayload.access_token;
    } catch {
      return null;
    }
  },
};
