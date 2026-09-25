import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { apiClient } from "../api/apiClient";
import { Reveal, LoadingState, ErrorState, EmptyState } from "../components/ui/primitives";
import {
  FolderKanban,
  ListChecks,
  Users,
  CheckCircle,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  User,
  Calendar,
  ArrowUpRight,
  Plus,
} from "lucide-react";

type DashboardStats = {
  totalProjects: number;
  activeTasks: number;
  teamMembers: number;
  completedTasks: number;
};

type ProjectOverviewItem = {
  id: string;
  name: string;
  progress: number;
  tasksCompleted: number;
  tasksTotal: number;
  status: "On Track" | "In Progress" | "At Risk" | "Completed";
  avatar: string;
};

type TaskDistribution = {
  label: "To Do" | "In Progress" | "Review" | "Completed";
  count: number;
  color: string;
};

type TaskAnalyticsPoint = {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  completed: number;
};

type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timeAgo: string;
  type: "completed" | "created" | "assigned" | "updated";
};

type UpcomingTaskItem = {
  id: string;
  title: string;
  dueLabel: string;
  priority: "High" | "Medium" | "Low";
  status: "Today" | "Tomorrow" | string;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DashboardHeader({ userName, userEmail }: { userName: string; userEmail: string }) {
  const firstName = userName.split(" ")[0] || userEmail.split("@")[0] || "there";
  const navigate = useNavigate();
  return (
    <div className="anim-rise flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Workspace</p>
        <h1 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-h)] sm:text-2xl">Dashboard</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text)]">
          {getGreeting()}, {firstName} <span className="hidden sm:inline">— Here&apos;s what&apos;s happening with your workspace today.</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
          <input
            placeholder="Search projects, tasks..."
            aria-label="Search projects and tasks"
            className="input !w-64 !pl-9 !py-2 text-[13px]"
          />
        </div>
        <button
          onClick={() => navigate("/projects")}
          aria-label="Create new project"
          className="btn btn-primary !py-2.5"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </button>
        <button
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          className="icon-btn"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="hidden items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-1.5 pr-3 shadow-[var(--shadow-sm)] md:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white" aria-hidden="true">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <div className="max-w-[160px] truncate text-xs font-semibold text-[var(--text-h)]">{userName}</div>
            <div className="max-w-[160px] truncate text-[11px] text-[var(--text-muted)]">{userEmail}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: DashboardStats }) {
  const navigate = useNavigate();
  const cards: Array<{
    label: string;
    value: number;
    trend: string;
    trendUp: boolean;
    icon: typeof FolderKanban;
    tile: string;
    to: string;
    ariaLabel: string;
  }> = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      trend: "this month",
      trendUp: true,
      icon: FolderKanban,
      tile: "bg-[var(--accent-bg)] text-[var(--accent)]",
      to: "/projects",
      ariaLabel: `Total Projects, ${stats.totalProjects}, view projects`,
    },
    {
      label: "Active Tasks",
      value: stats.activeTasks,
      trend: "this week",
      trendUp: true,
      icon: ListChecks,
      tile: "bg-[var(--info-bg)] text-[var(--info)]",
      to: "/tasks",
      ariaLabel: `Active Tasks, ${stats.activeTasks}, view tasks`,
    },
    {
      label: "Team Members",
      value: stats.teamMembers,
      trend: "and growing",
      trendUp: true,
      icon: Users,
      tile: "bg-[var(--success-bg)] text-[var(--success)]",
      to: "/team",
      ariaLabel: `Team Members, ${stats.teamMembers}, view team`,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      trend: "shipped",
      trendUp: false,
      icon: CheckCircle,
      tile: "bg-[var(--warning-bg)] text-[var(--warning)]",
      to: "/tasks",
      ariaLabel: `Completed Tasks, ${stats.completedTasks}, view tasks`,
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => navigate(card.to)}
          aria-label={card.ariaLabel}
          className="card card-hover group p-4 text-left sm:p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">{card.label}</span>
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${card.tile}`}>
              <card.icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3 text-[28px] font-bold leading-none tracking-tight text-[var(--text-h)]">{card.value}</div>
          <div className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${card.trendUp ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}>
            {card.trendUp ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
            {card.trend}
          </div>
        </button>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return <LoadingState message="Loading dashboard…" rows={3} />;
}

function DashboardError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return <ErrorState message={message ?? "Unable to load dashboard"} onRetry={onRetry} />;
}

function ProjectOverview({
  projects,
  isLoading,
  error,
  onRetry,
}: {
  projects: ProjectOverviewItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const navigate = useNavigate();
  const statusStyles: Record<ProjectOverviewItem["status"], string> = {
    "On Track": "badge-success",
    "In Progress": "badge-info",
    "At Risk": "badge-warning",
    Completed: "badge-neutral",
  };
  const progressColor: Record<ProjectOverviewItem["status"], string> = {
    "On Track": "bg-emerald-500",
    "In Progress": "bg-sky-500",
    "At Risk": "bg-amber-500",
    Completed: "bg-gray-400",
  };

  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} onRetry={onRetry} />;

  return (
    <div className="card card-hover overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-h)]">Project Overview</h3>
          <p className="mt-0.5 text-xs text-[var(--text)]">Delivery status across active work</p>
        </div>
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--accent-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          View all <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" aria-hidden="true" />}
          title="No projects yet"
          message="Create your first project to start tracking delivery."
          action={
            <button onClick={() => navigate("/projects")} className="btn btn-primary !py-2 text-xs">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New Project
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="table-shell">
            <thead>
              <tr>
                <th>Project</th>
                <th>Progress</th>
                <th>Tasks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((projectOverviewItem) => (
                <tr key={projectOverviewItem.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-bg)] text-xs font-bold text-[var(--accent)]"
                        aria-hidden="true"
                      >
                        {projectOverviewItem.avatar}
                      </span>
                      <span className="font-semibold text-[var(--text-h)]">{projectOverviewItem.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="w-28 sm:w-36">
                      <div className="flex items-center justify-between text-xs text-[var(--text)]">
                        <span className="font-semibold text-[var(--text-h)]">{projectOverviewItem.progress}%</span>
                      </div>
                      <div className="progress-track mt-1.5">
                        <div className={`progress-fill ${progressColor[projectOverviewItem.status]}`} style={{ width: `${projectOverviewItem.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-medium text-[var(--text-h)]">{projectOverviewItem.tasksCompleted}</span>
                    <span className="text-[var(--text-muted)]"> / {projectOverviewItem.tasksTotal}</span>
                  </td>
                  <td>
                    <span className={`badge ${statusStyles[projectOverviewItem.status]}`}>
                      {projectOverviewItem.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TaskOverview({
  distribution,
  isLoading,
  error,
}: {
  distribution: TaskDistribution[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const totalTasks = distribution.reduce((sum, taskDistributionItem) => sum + taskDistributionItem.count, 0);
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  if (distribution.length === 0 || totalTasks === 0) {
    return (
      <div className="card card-hover p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[var(--text-h)]">Task Overview</h3>
        <EmptyState title="No tasks yet" message="Tasks will appear once projects are active." />
      </div>
    );
  }
  return (
    <div className="card card-hover p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[var(--text-h)]">Task Overview</h3>
      <p className="mt-0.5 text-xs text-[var(--text)]">Distribution by status</p>
      <div className="mt-4 space-y-3.5">
        {distribution.map((taskDistributionItem) => {
          const pct = Math.round((taskDistributionItem.count / totalTasks) * 100);
          return (
            <div key={taskDistributionItem.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-h)]">{taskDistributionItem.label}</span>
                <span className="text-[var(--text-muted)]">{taskDistributionItem.count} • {pct}%</span>
              </div>
              <div className="progress-track !h-2">
                <div className={`progress-fill ${taskDistributionItem.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="card-sunken mt-4 flex items-center justify-between px-3.5 py-2.5">
        <span className="text-xs font-semibold text-[var(--text)]">Total tasks</span>
        <span className="text-sm font-bold text-[var(--text-h)]">{totalTasks}</span>
      </div>
    </div>
  );
}

function TaskAnalytics({
  data,
  isLoading,
  error,
}: {
  data: TaskAnalyticsPoint[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const maxCompleted = Math.max(1, ...data.map((taskAnalyticsPoint) => taskAnalyticsPoint.completed));
  const totalCompleted = data.reduce((sum, taskAnalyticsPoint) => sum + taskAnalyticsPoint.completed, 0);
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;

  return (
    <div className="card card-hover p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-h)]">Task Completion</h3>
          <p className="mt-0.5 text-xs text-[var(--text)]">Last 7 days</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-[var(--text-h)]">{totalCompleted} completed</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
              <TrendingUp className="h-3 w-3" aria-hidden="true" /> vs previous
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
        {data.map((taskAnalyticsPoint) => {
          const heightPct = (taskAnalyticsPoint.completed / maxCompleted) * 100;
          const isPeak = taskAnalyticsPoint.completed === maxCompleted && maxCompleted > 0;
          return (
            <div key={taskAnalyticsPoint.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full justify-center" style={{ height: "120px" }}>
                <div className="flex w-full max-w-[72px] items-end justify-center">
                  <div
                    className={`w-full rounded-t-lg transition-all ${isPeak ? "bg-[var(--accent)]" : "bg-[var(--accent)]/80 hover:bg-[var(--accent)]"}`}
                    style={{ height: `${heightPct}%`, minHeight: "12px" }}
                    role="img"
                    aria-label={`${taskAnalyticsPoint.day}: ${taskAnalyticsPoint.completed} tasks completed`}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-[var(--text)]">{taskAnalyticsPoint.day.slice(0, 3)}</span>
              <span className="text-xs font-semibold text-[var(--text-h)]">{taskAnalyticsPoint.completed}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity({
  activities,
  isLoading,
  error,
}: {
  activities: ActivityItem[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const iconMap: Record<ActivityItem["type"], React.ReactNode> = {
    completed: <CheckCircle className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />,
    created: <FileText className="h-4 w-4 text-[var(--info)]" aria-hidden="true" />,
    assigned: <User className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />,
    updated: <Clock className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />,
  };
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  if (activities.length === 0) {
    return (
      <div className="card card-hover p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[var(--text-h)]">Recent Activity</h3>
        <EmptyState title="No recent activity" message="Team actions will show up here." />
      </div>
    );
  }
  return (
    <div className="card card-hover p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[var(--text-h)]">Recent Activity</h3>
        <button className="rounded-lg px-2 py-1 text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--accent-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          View all
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {activities.map((activityItem) => (
          <div key={activityItem.id} className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] ring-1 ring-[var(--border)]">
              {iconMap[activityItem.type]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-[var(--text-h)]">
                <span className="font-medium">{activityItem.actor}</span> {activityItem.action}{" "}
                <span className="font-medium text-[var(--accent)]">&quot;{activityItem.target}&quot;</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--text)]">
                <Clock className="h-3 w-3" aria-hidden="true" /> {activityItem.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingTasks({
  tasks,
  isLoading,
  error,
}: {
  tasks: UpcomingTaskItem[];
  isLoading?: boolean;
  error?: string | null;
}) {
  const priorityStyle: Record<UpcomingTaskItem["priority"], string> = {
    High: "badge-danger",
    Medium: "badge-warning",
    Low: "badge-neutral",
  };
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  if (tasks.length === 0) {
    return (
      <div className="card card-hover p-4 sm:p-5">
        <h3 className="text-sm font-bold text-[var(--text-h)]">Upcoming Tasks</h3>
        <EmptyState title="No upcoming tasks" message="You're all caught up. Nice work." />
      </div>
    );
  }
  return (
    <div className="card card-hover p-4 sm:p-5">
      <h3 className="text-sm font-bold text-[var(--text-h)]">Upcoming Tasks</h3>
      <p className="mt-0.5 text-xs text-[var(--text)]">Due soon across your projects</p>
      <div className="mt-4 space-y-2.5">
        {tasks.map((upcomingTaskItem) => (
          <div key={upcomingTaskItem.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 px-3 py-2.5 transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--text-h)]">{upcomingTaskItem.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <Calendar className="h-3 w-3" aria-hidden="true" /> {upcomingTaskItem.dueLabel}
              </div>
            </div>
            <span className={`badge shrink-0 ${priorityStyle[upcomingTaskItem.priority]}`}>
              {upcomingTaskItem.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const authenticatedUser = useSaaSStore((s) => s.user);

  const userName = authenticatedUser?.name ?? authenticatedUser?.email?.split("@")[0] ?? "there";
  const userEmail = authenticatedUser?.email ?? "";

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectOverviewItem[]>([]);
  const [distribution, setDistribution] = useState<TaskDistribution[]>([]);
  const [analytics, setAnalytics] = useState<TaskAnalyticsPoint[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingTaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: any = await apiClient("/api/dashboard");
      const s = data.stats || data;
      setStats({
        totalProjects: s.totalProjects ?? data.totalProjects ?? 0,
        activeTasks: s.activeTasks ?? data.activeTasks ?? 0,
        teamMembers: s.activeTeamMembers ?? data.teamMembers ?? 0,
        completedTasks: s.completedTasks ?? data.completedTasks ?? 0,
      });
      setProjects(data.projectOverview ?? []);
      setDistribution(data.taskDistribution ?? []);
      setAnalytics(data.taskAnalytics ?? []);
      setActivities(data.recentActivity ?? []);
      setUpcoming(data.upcomingTasks ?? []);
    } catch (e: any) {
      setError(e?.message || "Unable to load dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="page-wrap">
        <div className="mx-auto max-w-[1280px]">
          <DashboardHeader userName={userName} userEmail={userEmail} />
          <div className="mt-6">
            <DashboardLoading />
          </div>
        </div>
      </div>
    );
  }

  const statsForCards: DashboardStats = stats ?? { totalProjects: 0, activeTasks: 0, teamMembers: 0, completedTasks: 0 };

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[1280px]">
        <DashboardHeader userName={userName} userEmail={userEmail} />

        <div className="mt-6">
          {error ? <DashboardError message={error} onRetry={fetchDashboard} /> : <StatsCards stats={statsForCards} />}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <ProjectOverview projects={projects} isLoading={isLoading} error={error} onRetry={fetchDashboard} />
          </Reveal>
          <Reveal delay={90}>
            <TaskOverview distribution={distribution} isLoading={isLoading} error={error} />
          </Reveal>
        </div>

        <Reveal delay={60} className="mt-5">
          <TaskAnalytics data={analytics} isLoading={isLoading} error={error} />
        </Reveal>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal>
            <RecentActivity activities={activities} isLoading={isLoading} error={error} />
          </Reveal>
          <Reveal delay={90}>
            <UpcomingTasks tasks={upcoming} isLoading={isLoading} error={error} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
