import { useSaaSStore, type Analytics, type DashboardStats, type Activity } from "../store";
import { BarChart3, TrendingUp, Users, FolderKanban, Activity as ActivityIcon } from "lucide-react";

interface AnalyticsCardProps {
  analytics: Analytics;
  dashboardStats: DashboardStats;
  activity: Activity[];
  isLoading: boolean;
}

function AnalyticsCard({ analytics, dashboardStats, activity, isLoading }: AnalyticsCardProps) {
  if (isLoading) return <div style={{ padding: 16 }}>Loading analytics…</div>;
  if (!analytics) return <div style={{ padding: 16, color: "var(--auth-text-muted)" }}>No analytics available.</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            <FolderKanban size={14} /> Projects
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{analytics.totalProjects}</div>
          <div style={{ fontSize: 12, color: "var(--nv-green)", display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={12} /> +{dashboardStats.revenueGrowth}% growth
          </div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            <BarChart3 size={14} /> Completed tasks
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{analytics.completedTasks}</div>
          <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>Across all projects</div>
        </div>
        <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
            <Users size={14} /> Team members
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-h)", marginTop: 6 }}>{analytics.activeTeamMembers}</div>
          <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>Active this month</div>
        </div>
      </div>

      <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
        <div style={{ fontWeight: 700, color: "var(--text-h)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={16} /> Revenue by project
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {analytics.revenueByProject.map((revenueEntry) => (
            <div key={revenueEntry.projectName} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{revenueEntry.projectName}</div>
              <div style={{ width: 180, height: 8, borderRadius: 999, background: "var(--bg)" as string, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, revenueEntry.revenue / 10)}%`, height: "100%", background: "var(--accent)" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-h)", minWidth: 60, textAlign: "right" }}>${revenueEntry.revenue}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)" }}>
        <div style={{ fontWeight: 700, color: "var(--text-h)", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
          <ActivityIcon size={16} /> Recent activity
        </div>
        {activity.length === 0 ? (
          <div style={{ color: "var(--auth-text-muted)", fontSize: 13 }}>No activity yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activity.map((activityEntry) => (
              <div key={activityEntry.id} style={{ fontSize: 13, color: "var(--text)", borderLeft: "2px solid var(--border)", paddingLeft: 10 }}>
                <strong style={{ color: "var(--text-h)" }}>{activityEntry.teamMemberName}</strong> {activityEntry.action}
                <span style={{ color: "var(--auth-text-muted)", marginLeft: 6, fontSize: 11 }}>{new Date(activityEntry.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const mockAnalytics: Analytics = {
  totalProjects: 12,
  completedTasks: 87,
  activeTeamMembers: 8,
  revenueGrowth: 14.2,
  tasksCompletedOverTime: [5, 8, 12, 9, 15],
  revenueByProject: [
    { projectName: "Atlas CRM", revenue: 42000 },
    { projectName: "Pulse Analytics", revenue: 31000 },
    { projectName: "Beacon Launch", revenue: 18000 },
  ],
};

const mockActivity: Activity[] = [
  { id: "a1", teamMemberId: "tm1", teamMemberName: "Alex Morgan", action: "completed task 'Design onboarding flow'", projectId: "p1", taskId: "t1", timestamp: new Date().toISOString() },
  { id: "a2", teamMemberId: "tm2", teamMemberName: "Jamie Chen", action: "created project 'Pulse Analytics'", projectId: "p4", taskId: null, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "a3", teamMemberId: "tm3", teamMemberName: "Samir Patel", action: "commented on task 'QA analytics dashboard'", projectId: "p4", taskId: "t3", timestamp: new Date(Date.now() - 7200000).toISOString() },
];

export default function AnalyticsPage() {
  const analytics = useSaaSStore((s) => s.analytics);
  const dashboardStats = useSaaSStore((s) => s.dashboardStats);
  const activity = useSaaSStore((s) => s.activity);
  const isLoading = useSaaSStore((s) => s.isLoading);

  const analyticsReport = analytics ?? mockAnalytics;
  const dashboardStatsReport = dashboardStats ?? mockAnalytics;
  const activityFeed = activity.length ? activity : mockActivity;

  return (
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <BarChart3 size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Analytics</h1>
      </div>
      <AnalyticsCard analytics={analyticsReport} dashboardStats={dashboardStatsReport} activity={activityFeed} isLoading={isLoading} />
    </div>
  );
}
