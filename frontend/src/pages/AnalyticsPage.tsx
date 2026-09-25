import { useEffect, useState } from "react";
import { useSaaSStore, type Analytics, type DashboardStats, type Activity } from "../store";
import { apiClient } from "../api/apiClient";
import { BarChart3, TrendingUp, Users, FolderKanban, Activity as ActivityIcon, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, CardHeader, Reveal, EmptyState, LoadingState, ErrorState } from "../components/ui/primitives";

interface AnalyticsCardProps {
  analytics: Analytics;
  dashboardStats: DashboardStats;
  activity: Activity[];
  isLoading: boolean;
}

function AnalyticsCard({ analytics, dashboardStats, activity, isLoading }: AnalyticsCardProps) {
  if (isLoading) return <LoadingState message="Loading analytics…" rows={4} />;
  if (!analytics)
    return (
      <Card hover>
        <EmptyState title="No analytics available" message="Data will appear once projects and tasks are active." />
      </Card>
    );

  const maxRevenue = Math.max(1, ...analytics.revenueByProject.map((r) => r.revenue));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Projects</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-[var(--accent)]">
              <FolderKanban size={17} aria-hidden />
            </span>
          </div>
          <div className="mt-3 text-[30px] font-bold leading-none tracking-tight text-[var(--text-h)]">{analytics.totalProjects}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
            <TrendingUp size={13} aria-hidden /> +{dashboardStats.revenueGrowth}% growth
          </div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Completed tasks</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--info-bg)] text-[var(--info)]">
              <BarChart3 size={17} aria-hidden />
            </span>
          </div>
          <div className="mt-3 text-[30px] font-bold leading-none tracking-tight text-[var(--text-h)]">{analytics.completedTasks}</div>
          <div className="mt-2 text-xs text-[var(--text-muted)]">Across all projects</div>
        </div>
        <div className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Team members</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--success-bg)] text-[var(--success)]">
              <Users size={17} aria-hidden />
            </span>
          </div>
          <div className="mt-3 text-[30px] font-bold leading-none tracking-tight text-[var(--text-h)]">{analytics.activeTeamMembers}</div>
          <div className="mt-2 text-xs text-[var(--text-muted)]">Active this month</div>
        </div>
      </div>

      <Reveal>
        <Card hover>
          <CardHeader title="Revenue by project" subtitle="Relative contribution to total revenue" />
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {analytics.revenueByProject.map((revenueEntry) => (
              <div key={revenueEntry.projectName} className="flex items-center gap-3">
                <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text)]">{revenueEntry.projectName}</div>
                <div className="progress-track hidden w-40 sm:block md:w-56">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (revenueEntry.revenue / maxRevenue) * 100)}%` }} />
                </div>
                <div className="min-w-[72px] text-right text-[13px] font-bold tabular-nums text-[var(--text-h)]">${revenueEntry.revenue}</div>
              </div>
            ))}
            {analytics.revenueByProject.length === 0 && (
              <p className="py-4 text-center text-[13px] text-[var(--text-muted)]">No revenue data yet.</p>
            )}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={80}>
        <Card hover>
          <CardHeader title="Recent activity" subtitle="Latest actions across the workspace" />
          {activity.length === 0 ? (
            <EmptyState
              icon={<ActivityIcon className="h-5 w-5" aria-hidden />}
              title="No activity yet"
              message="Team actions will appear here as work happens."
            />
          ) : (
            <div className="flex flex-col gap-1 p-2.5">
              {activity.map((activityEntry) => (
                <div
                  key={activityEntry.id}
                  className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--accent-bg)]"
                >
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
                    <CheckCircle2 size={14} className="text-[var(--success)]" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1 text-[13px] leading-snug text-[var(--text)]">
                    <strong className="font-semibold text-[var(--text-h)]">{activityEntry.teamMemberName}</strong>{" "}
                    {activityEntry.action}
                    <span className="ml-2 whitespace-nowrap text-[11px] text-[var(--text-muted)]">
                      {new Date(activityEntry.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
}

export default function AnalyticsPage() {
  const analytics = useSaaSStore((s) => s.analytics);
  const dashboardStats = useSaaSStore((s) => s.dashboardStats);
  const activity = useSaaSStore((s) => s.activity);
  const isLoading = useSaaSStore((s) => s.isLoading);
  const setAnalytics = useSaaSStore((s) => s.setAnalytics);
  const setActivity = useSaaSStore((s) => s.setActivity);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setIsFetching(true);
    setIsLoading(true);
    setFetchError(null);
    try {
      const data: any = await apiClient("/api/analytics");
      if (data.analytics) setAnalytics(data.analytics);
      if (data.activity) setActivity(data.activity);
    } catch (e: any) {
      const message = e?.message || "Unable to load analytics from the database.";
      setFetchError(message);
      pushToast({ kind: "error", title: "Failed to load analytics", msg: message });
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (fetchError && !analytics) {
    return (
      <div className="page-wrap">
        <div className="mx-auto max-w-[1280px]">
          <PageHeader
            eyebrow="Insights"
            title="Analytics"
            description="Revenue, throughput and team momentum — updated in real time."
          />
          <div className="mt-5">
            <ErrorState message={fetchError} onRetry={fetchAnalytics} />
          </div>
        </div>
      </div>
    );
  }

  const analyticsReport = analytics ?? { totalProjects: 0, completedTasks: 0, activeTeamMembers: 0, revenueGrowth: 0, tasksCompletedOverTime: [], revenueByProject: [] };
  const dashboardStatsReport = dashboardStats ?? analyticsReport;
  const activityFeed = activity;

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[1280px]">
        <PageHeader
          eyebrow="Insights"
          title="Analytics"
          description="Revenue, throughput and team momentum — updated in real time."
        />
        <div className="mt-5">
          <AnalyticsCard analytics={analyticsReport} dashboardStats={dashboardStatsReport} activity={activityFeed} isLoading={isFetching || isLoading} />
        </div>
      </div>
    </div>
  );
}
