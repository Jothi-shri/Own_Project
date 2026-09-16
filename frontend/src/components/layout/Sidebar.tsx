import { NavLink, useNavigate } from "react-router-dom";
import { useSaaSStore } from "../../store";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Users,
  ChartNoAxesCombined,
  Bell,
  Settings,
  LogOut,
  X,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const authenticatedUser = useSaaSStore((s) => s.user);
  const notifications = useSaaSStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const logout = useSaaSStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
      isActive
        ? "bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
        : "text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)]"
    }`;

  const sectionLabel = "text-[11px] font-semibold uppercase tracking-wider text-[var(--sidebar-text-muted)] opacity-80";

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[240px]";
  const overlay = mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0";

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={onMobileClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] transition-all duration-200 ${sidebarWidth} ${overlay} lg:sticky lg:h-screen`}
        aria-label="Sidebar"
      >
        <div className="flex h-14 items-center justify-between border-b border-[var(--sidebar-border)] px-3">
          <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white shadow-sm">S</div>
          </div>
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
          <button
            onClick={onMobileClose}
            aria-label="Close sidebar"
            className="inline-flex lg:hidden h-7 w-7 items-center justify-center rounded-md text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-6">
            <div>
              {!collapsed && <div className={`${sectionLabel} mb-2 px-2`}>Main</div>}
              <div className="space-y-1">
                <NavLink to="/dashboard" className={navLinkClasses} onClick={onMobileClose}>
                  <LayoutDashboard className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Dashboard</span>}
                </NavLink>
                <NavLink to="/projects" className={navLinkClasses} onClick={onMobileClose}>
                  <FolderKanban className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Projects</span>}
                </NavLink>
                <NavLink to="/tasks" className={navLinkClasses} onClick={onMobileClose}>
                  <ListChecks className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Tasks</span>}
                </NavLink>
              </div>
            </div>

            <div>
              {!collapsed && <div className={`${sectionLabel} mb-2 px-2`}>Management</div>}
              <div className="space-y-1">
                <NavLink to="/team" className={navLinkClasses} onClick={onMobileClose}>
                  <Users className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Team</span>}
                </NavLink>
                <NavLink to="/analytics" className={navLinkClasses} onClick={onMobileClose}>
                  <ChartNoAxesCombined className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Analytics</span>}
                </NavLink>
              </div>
            </div>

            <div>
              {!collapsed && <div className={`${sectionLabel} mb-2 px-2`}>Other</div>}
              <div className="space-y-1">
                <NavLink to="/notifications" className={navLinkClasses} onClick={onMobileClose}>
                  <Bell className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="flex items-center gap-2">Notifications {unread > 0 && <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>}</span>}
                  {collapsed && unread > 0 && <span className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]" />}
                </NavLink>
                <NavLink to="/settings" className={navLinkClasses} onClick={onMobileClose}>
                  <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {!collapsed && <span>Settings</span>}
                </NavLink>
              </div>
            </div>
          </div>
        </nav>

        <div className="border-t border-[var(--sidebar-border)] p-2">
          {authenticatedUser && (
            <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
                {authenticatedUser.name[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium leading-none text-[var(--sidebar-text)]">{authenticatedUser.name}</div>
                  <div className="truncate text-[11px] leading-none text-[var(--sidebar-text-muted)]">{authenticatedUser.email}</div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`mt-2 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sidebar-text-muted)] hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
