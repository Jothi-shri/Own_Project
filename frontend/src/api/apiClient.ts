import { authService } from "./authService";
import { useSaaSStore } from "../store";

/** Single-flight refresh — concurrent 401s share one network attempt. */
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const newToken = await authService.refresh();
    if (newToken) {
      // Keep token in Zustand memory only
      useSaaSStore.getState().setAccessToken(newToken);
      // Optionally refresh user if not already set
      const currentUser = useSaaSStore.getState().user;
      if (!currentUser) {
        const me = await authService.fetchMe(newToken);
        if (me) {
          // Persist user (not token) and update store
          authService.persist(newToken, "", me);
          useSaaSStore.setState({ user: me });
        }
      }
      return true;
    }
    return false;
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

function clearAndRedirect() {
  // Clear frontend auth state (memory) and redirect to /
  const store = useSaaSStore.getState();
  // fire-and-forget logout to clear HttpOnly cookie
  authService.logout().catch(() => {});
  store.setAccessToken(null);
  // Use store logout to clear user as well
  useSaaSStore.setState({ user: null, isAdminSession: false, authView: "login", accessToken: null });
  authService.clear();
  try {
    localStorage.removeItem("user");
  } catch {}
  window.location.href = "/";
}

export async function apiClient<T = any>(
  path: string,
  body?: unknown,
  method?: string,
): Promise<T> {
  const token = useSaaSStore.getState().accessToken;
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    method: method ?? (body ? "POST" : "GET"),
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = useSaaSStore.getState().accessToken;
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      const retry = await fetch(path, {
        method: method ?? (body ? "POST" : "GET"),
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: "include",
      });
      if (!retry.ok) {
        clearAndRedirect();
        throw new Error(`${retry.status} ${await retry.text()}`);
      }
      return retry.json();
    }
    clearAndRedirect();
    throw new Error("Session expired");
  }

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Back-compat: some code imports { api } from "./api"
export const api = apiClient;
export default apiClient;
