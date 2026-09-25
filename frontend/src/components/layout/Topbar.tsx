import { useLocation, useNavigate } from "react-router-dom";
import { useSaaSStore } from "../../store";
import { Bell, Menu, Search, Sun, Moon, Waves } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticatedUser = useSaaSStore((s) => s.user);
  const notifications = useSaaSStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const theme = useSaaSStore((s) => s.theme);
  const setTheme = useSaaSStore((s) => s.setTheme);
  const setCmdkOpen = useSaaSStore((s) => s.setCmdkOpen);

  const metaMap: Record<string, { title: string; hint: string }> = {
    "/dashboard": { title: "Dashboard", hint: "Monitor workspace health at a glance" },
    "/projects": { title: "Projects", hint: "Plan, track and ship your work" },
    "/tasks": { title: "Tasks", hint: "Keep every deliverable on schedule" },
    "/team": { title: "Team", hint: "People, roles and access" },
    "/analytics": { title: "Analytics", hint: "Revenue, throughput and trends" },
    "/notifications": { title: "Notifications", hint: "Stay on top of what matters" },
    "/settings": { title: "Settings", hint: "Tune your workspace experience" },
  };
  const meta = metaMap[location.pathname] ?? { title: "Dashboard", hint: "" };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--topbar-bg)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="icon-btn lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[15px] font-bold tracking-tight text-[var(--text-h)]">{meta.title}</h2>
              {unread > 0 && location.pathname !== "/notifications" && (
                <span className="badge badge-accent hidden sm:inline-flex">{unread} new</span>
              )}
            </div>
            <p className="hidden truncate text-xs text-[var(--text)] sm:block">
              {meta.hint}
              {authenticatedUser ? ` — Welcome back, ${authenticatedUser.name.split(" ")[0]}` : ""}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setCmdkOpen(true)}
            aria-label="Jump to page or item (Ctrl K)"
            title="Jump to… (Ctrl/⌘ K)"
            className="group flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-muted)] shadow-[var(--shadow-sm)] transition-all duration-150 hover:border-[var(--accent-border)] hover:text-[var(--text-h)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] sm:w-52 sm:px-3"
          >
            <Search size={15} className="shrink-0 transition-transform duration-150 group-hover:scale-110" aria-hidden />
            <span className="hidden flex-1 text-left font-medium sm:block">Jump to…</span>
            <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-muted)] md:inline-flex">
              ⌘K
            </kbd>
          </button>

          <div
            className="hidden items-center gap-0.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 sm:flex"
            role="group"
            aria-label="Theme"
          >
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
                title={`${opt.label} theme`}
                className={`rounded-lg p-1.5 transition-all duration-150 ${
                  theme === opt.v
                    ? "bg-[var(--accent)] text-white shadow-sm scale-100"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-h)] active:scale-95"
                }`}
              >
                <opt.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <button
            aria-label={`Notifications, ${unread} unread`}
            title="Notifications"
            className="icon-btn relative"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold leading-none text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {authenticatedUser && (
            <div className="hidden items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-1.5 pr-3 sm:flex">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">
                {authenticatedUser.name[0]?.toUpperCase()}
              </div>
              <div className="hidden text-left leading-tight lg:block">
                <div className="max-w-[140px] truncate text-xs font-semibold text-[var(--text-h)]">{authenticatedUser.name}</div>
                <div className="max-w-[140px] truncate text-[11px] text-[var(--text-muted)]">{authenticatedUser.email}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
