import { useNavigate } from "react-router-dom";
import { useSaaSStore, type DashboardStats, type Activity, type Notification, type Project } from "../store";
import { LayoutDashboard, LogOut, TrendingUp, CheckCircle2, Users, FolderKanban, Activity as ActivityIcon } from "lucide-react";

interface DashboardPageProps {
  user: { name: string; email: string } | null;
  dashboardStats: DashboardStats | null;
  activity: Activity[];
  notifications: Notification[];
  selectedProject: Project | null;
  isLoading: boolean;
  onSelect: (selectedProject: Project) => void;
}

function DashboardContent({ user, dashboardStats, activity, notifications, selectedProject, isLoading, onSelect }: DashboardPageProps) {
  if (isLoading) {
    return <div style={{ padding: 16, color: "var(--text)" }}>Loading dashboard…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ color: "var(--text)", margin: 0 }}>
        Welcome{user ? `, ${user.name}` : ""}! You are signed in{user ? ` as ${user.email}` : ""}.
        {selectedProject ? (
          <span>
            {" "}
            Selected project: <strong style={{ color: "var(--text-h)" }}>{selectedProject.name}</strong>
          </span>
        ) : (
          " — no project selected."
        )}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <FolderKanban size={12} /> Projects
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{dashboardStats?.totalProjects ?? 0}</div>
          <div style={{ fontSize: 12, color: "var(--nv-green)", display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={12} /> {dashboardStats?.revenueGrowth ?? 0}% growth
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={12} /> Completed tasks
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{dashboardStats?.completedTasks ?? 0}</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 700, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Users size={12} /> Team
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{dashboardStats?.activeTeamMembers ?? 0}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-h)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <ActivityIcon size={14} /> Recent activity
          </div>
          {activity.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--auth-text-muted)" }}>No activity yet.</div>
          ) : (
            activity.slice(0, 3).map((activityEntry) => (
              <div key={activityEntry.id} style={{ fontSize: 12, color: "var(--text)", marginBottom: 6 }}>
                <strong style={{ color: "var(--text-h)" }}>{activityEntry.teamMemberName}</strong> {activityEntry.action}
              </div>
            ))
          )}
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ fontWeight: 700, color: "var(--text-h)", marginBottom: 8 }}>Notifications</div>
          {notifications.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--auth-text-muted)" }}>No notifications.</div>
          ) : (
            notifications.slice(0, 3).map((notification) => (
              <div key={notification.id} style={{ fontSize: 12, color: "var(--text)", marginBottom: 6 }}>
                <strong style={{ color: "var(--text-h)" }}>{notification.title}</strong> — {notification.message}
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProject && (
        <button
          onClick={() => onSelect(selectedProject)}
          style={{ alignSelf: "flex-start", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12 }}
        >
          View {selectedProject.name}
        </button>
      )}
    </div>
  );
}

const fallbackDashboardStats: DashboardStats = {
  totalProjects: 12,
  completedTasks: 87,
  activeTeamMembers: 8,
  revenueGrowth: 14.2,
  tasksCompletedOverTime: [5, 8, 12],
  revenueByProject: [{ projectName: "Atlas CRM", revenue: 42000 }],
};

export default function DashboardPage() {
  const authenticatedUser = useSaaSStore((s) => s.user);
  const dashboardStats = useSaaSStore((s) => s.dashboardStats);
  const analytics = useSaaSStore((s) => s.analytics);
  const activity = useSaaSStore((s) => s.activity);
  const notifications = useSaaSStore((s) => s.notifications);
  const selectedProject = useSaaSStore((s) => s.selectedProject);
  const isLoading = useSaaSStore((s) => s.isLoading);
  const setSelectedProject = useSaaSStore((s) => s.setSelectedProject);
  const logout = useSaaSStore((s) => s.logout);
  const navigate = useNavigate();

  const resolvedDashboardStats = dashboardStats ?? analytics ?? fallbackDashboardStats;
  const activityFeed = activity.length ? activity : [];
  const notificationList = notifications.length ? notifications : [];

  const handleSelectProject: DashboardPageProps["onSelect"] = (projectToSelect) => {
    setSelectedProject(projectToSelect);
    navigate("/projects");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LayoutDashboard size={28} style={{ color: "var(--accent)" }} />
          <h1 style={{ margin: 0, fontSize: 32 }}>Dashboard</h1>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--code-bg)",
            color: "var(--text-h)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      <DashboardContent
        user={authenticatedUser}
        dashboardStats={resolvedDashboardStats}
        activity={activityFeed}
        notifications={notificationList}
        selectedProject={selectedProject}
        isLoading={isLoading}
        onSelect={handleSelectProject}
      />
    </div>
  );
}
