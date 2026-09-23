import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { apiClient } from "../api/apiClient";
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
  AlertCircle,
  Loader2,
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
  const firstName = userName.split(" ")[0] || "Sri";
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-h)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--text)]">
          {getGreeting()}, {firstName} <span className="hidden sm:inline">— Here&apos;s what&apos;s happening with your workspace today.</span>
        </p>
        <p className="sm:hidden mt-1 text-sm text-[var(--text)]">Here&apos;s what&apos;s happening today.</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text)] opacity-60" aria-hidden="true" />
          <input
            placeholder="Search projects, tasks..."
            aria-label="Search projects and tasks"
            className="h-9 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg)] pl-9 pr-3 text-sm text-[var(--text-h)] placeholder:text-[var(--text)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          />
        </div>
        <button
          onClick={() => navigate("/projects")}
          aria-label="Create new project"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] sm:gap-2 sm:px-4"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">New</span>
        </button>
        <button
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:bg-[var(--code-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white" aria-hidden="true">
            {firstName[0]?.toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <div className="text-xs font-medium leading-none text-[var(--text-h)]">{userName}</div>
            <div className="text-[11px] leading-none text-[var(--text)]">{userEmail}</div>
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
    iconBg: string;
    iconColor: string;
    to: string;
    ariaLabel: string;
  }> = [
    {
      label: "Total Projects",
      value: stats.totalProjects,
      trend: "↑ this month",
      trendUp: true,
      icon: FolderKanban,
      iconBg: "bg-[var(--accent-bg)]",
      iconColor: "text-[var(--accent)]",
      to: "/projects",
      ariaLabel: `Total Projects, ${stats.totalProjects}, view projects`,
    },
    {
      label: "Active Tasks",
      value: stats.activeTasks,
      trend: "↑ this week",
      trendUp: true,
      icon: ListChecks,
      iconBg: "bg-[var(--accent-bg)]",
      iconColor: "text-[var(--accent)]",
      to: "/tasks",
      ariaLabel: `Active Tasks, ${stats.activeTasks}, view tasks`,
    },
    {
      label: "Team Members",
      value: stats.teamMembers,
      trend: "↑ team",
      trendUp: true,
      icon: Users,
      iconBg: "bg-[var(--accent-bg)]",
      iconColor: "text-[var(--accent)]",
      to: "/team",
      ariaLabel: `Team Members, ${stats.teamMembers}, view team`,
    },
    {
      label: "Completed Tasks",
      value: stats.completedTasks,
      trend: "completed",
      trendUp: false,
      icon: CheckCircle,
      iconBg: "bg-[var(--accent-bg)]",
      iconColor: "text-[var(--accent)]",
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
          className="group text-left rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 cursor-pointer transition hover:border-[var(--accent-border)] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text)]">{card.label}</span>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold text-[var(--text-h)]">{card.value}</div>
          <div className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${card.trendUp ? "text-emerald-600" : "text-[var(--text)]"}`}>
            {card.trendUp ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
            {card.trend}
          </div>
        </button>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-6 text-sm text-[var(--text)]">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading dashboard...
    </div>
  );
}

function DashboardError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 dark:border-red-900/50 dark:bg-red-950/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-red-800 dark:text-red-300">{message ?? "Unable to load dashboard"}</p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-400">Try again</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
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
    "On Track": "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    "In Progress": "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300",
    "At Risk": "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
    Completed: "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-800 dark:text-gray-300",
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Project Overview</h3>
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          View all <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--code-bg)]">
            <FolderKanban className="h-5 w-5 text-[var(--text)]" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--text-h)]">No projects yet</p>
          <p className="mt-1 text-xs text-[var(--text)]">Create your first project to get started</p>
          <button
            onClick={() => navigate("/projects")}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> New Project
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--code-bg)] text-xs uppercase tracking-wider text-[var(--text)]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Project</th>
                <th className="px-4 py-2.5 font-medium">Progress</th>
                <th className="px-4 py-2.5 font-medium">Tasks</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {projects.map((projectOverviewItem) => (
                <tr key={projectOverviewItem.id} className="hover:bg-[var(--code-bg)]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--text-h)] text-xs font-semibold text-[var(--bg)]"
                        aria-hidden="true"
                      >
                        {projectOverviewItem.avatar}
                      </span>
                      <span className="font-medium text-[var(--text-h)]">{projectOverviewItem.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-28">
                      <div className="flex items-center justify-between text-xs text-[var(--text)]">
                        <span>{projectOverviewItem.progress}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--border)]">
                        <div className={`h-1.5 rounded-full ${progressColor[projectOverviewItem.status]}`} style={{ width: `${projectOverviewItem.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--text)]">
                    {projectOverviewItem.tasksCompleted} / {projectOverviewItem.tasksTotal}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusStyles[projectOverviewItem.status]}`}>
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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Task Overview</h3>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text)]">No tasks yet</p>
          <p className="mt-1 text-xs text-[var(--text)] opacity-70">Tasks will appear once projects are active</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-h)]">Task Overview</h3>
      <p className="mt-1 text-xs text-[var(--text)]">Distribution by status</p>
      <div className="mt-4 space-y-3">
        {distribution.map((taskDistributionItem) => {
          const pct = Math.round((taskDistributionItem.count / totalTasks) * 100);
          return (
            <div key={taskDistributionItem.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-h)]">{taskDistributionItem.label}</span>
                <span className="text-[var(--text)]">{taskDistributionItem.count} • {pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--border)]">
                <div className={`h-2 rounded-full ${taskDistributionItem.color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--code-bg)] px-3 py-2">
        <span className="text-xs font-medium text-[var(--text)]">Total tasks</span>
        <span className="text-sm font-semibold text-[var(--text-h)]">{totalTasks}</span>
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-h)]">Task Completion</h3>
          <p className="mt-1 text-xs text-[var(--text)]">Last 7 days</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[var(--text-h)]">{totalCompleted} completed</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
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
    completed: <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />,
    created: <FileText className="h-4 w-4 text-sky-600" aria-hidden="true" />,
    assigned: <User className="h-4 w-4 text-violet-600" aria-hidden="true" />,
    updated: <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />,
  };
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Recent Activity</h3>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text)]">No recent activity</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Recent Activity</h3>
        <button className="text-xs font-medium text-[var(--accent)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]">
          View all
        </button>
      </div>
      <div className="mt-4 space-y-4">
        {activities.map((activityItem) => (
          <div key={activityItem.id} className="flex gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--code-bg)]">
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
    High: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300",
    Medium: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300",
    Low: "bg-[var(--code-bg)] text-[var(--text)] ring-[var(--border)]",
  };
  if (isLoading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-h)]">Upcoming Tasks</h3>
        <div className="py-8 text-center">
          <p className="text-sm text-[var(--text)]">No upcoming tasks</p>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-h)]">Upcoming Tasks</h3>
      <div className="mt-4 space-y-3">
        {tasks.map((upcomingTaskItem) => (
          <div key={upcomingTaskItem.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-3 py-2.5 hover:bg-[var(--code-bg)]/50">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--text-h)]">{upcomingTaskItem.title}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text)]">
                <Calendar className="h-3 w-3" aria-hidden="true" /> {upcomingTaskItem.dueLabel}
              </div>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityStyle[upcomingTaskItem.priority]}`}>
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

  const userName = authenticatedUser?.name ?? "User";
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
      <div className="min-h-full bg-[var(--main-bg)]">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
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
    <div className="min-h-full bg-[var(--main-bg)]">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader userName={userName} userEmail={userEmail} />

        <div className="mt-6">
          {error ? <DashboardError message={error} onRetry={fetchDashboard} /> : <StatsCards stats={statsForCards} />}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ProjectOverview projects={projects} isLoading={isLoading} error={error} onRetry={fetchDashboard} />
          </div>
          <div>
            <TaskOverview distribution={distribution} isLoading={isLoading} error={error} />
          </div>
        </div>

        <div className="mt-6">
          <TaskAnalytics data={analytics} isLoading={isLoading} error={error} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity activities={activities} isLoading={isLoading} error={error} />
          <UpcomingTasks tasks={upcoming} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
  );
}
