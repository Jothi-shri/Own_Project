import { useLocation } from "react-router-dom";
import { useSaaSStore } from "../../store";
import { Bell, Search, Menu, Sun, Moon, Waves } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const authenticatedUser = useSaaSStore((s) => s.user);
  const notifications = useSaaSStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const theme = useSaaSStore((s) => s.theme);
  const setTheme = useSaaSStore((s) => s.setTheme);

  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/team": "Team",
    "/analytics": "Analytics",
    "/notifications": "Notifications",
    "/settings": "Settings",
  };
  const title = titleMap[location.pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--topbar-bg)] px-4 backdrop-blur supports-[backdrop-filter]:bg-[var(--topbar-bg)] sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--code-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-h)]">{title}</h2>
          <p className="hidden text-xs text-[var(--text)] sm:block">Welcome back, {authenticatedUser?.name?.split(" ")[0] ?? "there"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)] opacity-60" aria-hidden="true" />
          <input
            placeholder="Search..."
            aria-label="Search"
            className="h-8 w-48 rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-9 pr-3 text-sm text-[var(--text-h)] placeholder:text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 lg:w-64"
          />
        </div>

        <div className="hidden items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1 sm:flex">
          {[
            { v: "light" as const, icon: Sun, label: "Light" },
            { v: "dark" as const, icon: Moon, label: "Dark" },
            { v: "ocean" as const, icon: Waves, label: "Ocean" },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setTheme(opt.v)}
              aria-label={`Switch to ${opt.label} theme`}
              aria-pressed={theme === opt.v}
              className={`rounded-md p-1.5 transition ${theme === opt.v ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--text)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"}`}
            >
              <opt.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          aria-label={`Notifications, ${unread} unread`}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--code-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          onClick={() => (window.location.href = "/notifications")}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white">{unread}</span>}
        </button>

        {authenticatedUser && (
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
              {authenticatedUser.name[0]?.toUpperCase()}
            </div>
            <div className="hidden text-left lg:block">
              <div className="text-xs font-medium leading-none text-[var(--text-h)]">{authenticatedUser.name}</div>
              <div className="text-[11px] leading-none text-[var(--text)]">{authenticatedUser.email}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
