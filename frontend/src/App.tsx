import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useSaaSStore, applyTheme } from "./store";

import Login from "./auth/login";
import Register from "./auth/register";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import TasksPage from "./pages/TasksPage";
import TeamPage from "./pages/TeamPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import { LayoutDashboard, FolderKanban, ClipboardList, Users, BarChart3, Bell, Settings, LogOut } from "lucide-react";

interface RequireAuthProps {
  protectedContent: React.ReactNode;
}

function RequireAuth({ protectedContent }: RequireAuthProps) {
  const authenticatedUser = useSaaSStore((s) => s.user);
  if (!authenticatedUser) return <Navigate to="/login" replace />;
  return <>{protectedContent}</>;
}

function AuthLayout() {
  const selectedAuthView = useSaaSStore((s) => s.authView);
  const isRegisterView = selectedAuthView === "register";
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-8">
      <div className="w-full max-w-[440px] text-left">{isRegisterView ? <Register /> : <Login />}</div>
    </div>
  );
}

function RegisterPage() {
  const setSelectedAuthView = useSaaSStore((s) => s.setAuthView);
  useEffect(() => {
    setSelectedAuthView("register");
  }, [setSelectedAuthView]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-8">
      <div className="w-full max-w-[440px] text-left">
        <Register />
      </div>
    </div>
  );
}

function LoginPage() {
  const setSelectedAuthView = useSaaSStore((s) => s.setAuthView);
  useEffect(() => {
    setSelectedAuthView("login");
  }, [setSelectedAuthView]);
  return <AuthLayout />;
}

function ToastStack() {
  const toastNotifications = useSaaSStore((s) => s.toasts);
  const dismissToastNotification = useSaaSStore((s) => s.dismissToast);
  if (toastNotifications.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toastNotifications.map((toastNotification) => (
        <div
          key={toastNotification.id}
          onClick={() => dismissToastNotification(toastNotification.id)}
          role="status"
          className={`pointer-events-auto min-w-[280px] max-w-[360px] rounded-[10px] border bg-[var(--code-bg)] p-3 text-sm shadow-[var(--shadow)] ${
            toastNotification.kind === "success"
              ? "border-[rgba(34,197,94,0.35)]"
              : toastNotification.kind === "error"
                ? "border-[rgba(239,68,68,0.35)]"
                : "border-[var(--accent-border)]"
          }`}
        >
          <div className="font-bold text-[var(--text-h)]">{toastNotification.title}</div>
          {toastNotification.msg && <div className="font-medium text-[var(--text)]">{toastNotification.msg}</div>}
        </div>
      ))}
    </div>
  );
}

function SaaSNavigation() {
  const authenticatedUser = useSaaSStore((s) => s.user);
  const notifications = useSaaSStore((s) => s.notifications);
  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;
  const logout = useSaaSStore((s) => s.logout);
  if (!authenticatedUser) return null;

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navigationLinkStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 10px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text)",
    textDecoration: "none",
  };

  return (
    <nav style={{ display: "flex", gap: 6, padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--code-bg)", overflowX: "auto", alignItems: "center" }}>
      <NavLink to="/dashboard" style={navigationLinkStyle}>
        <LayoutDashboard size={14} /> Dashboard
      </NavLink>
      <NavLink to="/projects" style={navigationLinkStyle}>
        <FolderKanban size={14} /> Projects
      </NavLink>
      <NavLink to="/tasks" style={navigationLinkStyle}>
        <ClipboardList size={14} /> Tasks
      </NavLink>
      <NavLink to="/team" style={navigationLinkStyle}>
        <Users size={14} /> Team
      </NavLink>
      <NavLink to="/analytics" style={navigationLinkStyle}>
        <BarChart3 size={14} /> Analytics
      </NavLink>
      <NavLink to="/notifications" style={navigationLinkStyle}>
        <Bell size={14} /> Notifications {unreadNotificationCount > 0 ? `(${unreadNotificationCount})` : ""}
      </NavLink>
      <NavLink to="/settings" style={navigationLinkStyle}>
        <Settings size={14} /> Settings
      </NavLink>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: "var(--text)", display: "inline-flex", alignItems: "center", gap: 6 }}>
        {authenticatedUser.name} • {authenticatedUser.email}
      </span>
      <button
        onClick={handleLogout}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
      >
        <LogOut size={12} /> Logout
      </button>
    </nav>
  );
}

export default function App() {
  const authenticatedUser = useSaaSStore((s) => s.user);
  const theme = useSaaSStore((s) => s.theme);
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  useEffect(() => {
    useSaaSStore.getState().initializeAuth();
  }, []);
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1126px] flex-col border-x border-[var(--border)] bg-[var(--bg)] text-[var(--text)]">
      <SaaSNavigation />
      <Routes>
        <Route path="/login" element={authenticatedUser ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={authenticatedUser ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
        <Route path="/auth" element={authenticatedUser ? <Navigate to="/dashboard" replace /> : <AuthLayout />} />

        <Route path="/dashboard" element={<RequireAuth protectedContent={<DashboardPage />} />} />
        <Route path="/projects" element={<RequireAuth protectedContent={<ProjectsPage />} />} />
        <Route path="/tasks" element={<RequireAuth protectedContent={<TasksPage />} />} />
        <Route path="/team" element={<RequireAuth protectedContent={<TeamPage />} />} />
        <Route path="/analytics" element={<RequireAuth protectedContent={<AnalyticsPage />} />} />
        <Route path="/notifications" element={<RequireAuth protectedContent={<NotificationsPage />} />} />
        <Route path="/settings" element={<RequireAuth protectedContent={<SettingsPage />} />} />

        <Route path="/" element={<Navigate to={authenticatedUser ? "/dashboard" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={authenticatedUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
      <ToastStack />
    </div>
  );
}
