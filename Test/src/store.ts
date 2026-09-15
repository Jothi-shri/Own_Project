import { create } from "zustand";
import { authService, type AuthUser } from "./auth/authService";

export interface SaaSFeature {
  id: string;
  label: string;
  icon: string;
  group: string;
  status: string;
  workspace: string;
  tagline: string;
  summary: string;
  capabilities: string[];
  roadmap?: string | null;
}
// Backwards-compat alias — prefers SaaS naming
export type StoredFeature = SaaSFeature;

// UI color themes. "dark" is the default SaaS palette in styles.css
// (:root); the others are applied as [data-theme="…"] overrides.
export type Theme = "dark" | "light" | "ocean" | "nebula";
const THEME_KEY = "saas-theme";

function loadTheme(): Theme {
  if (typeof localStorage === "undefined") return "dark";
  const t = localStorage.getItem(THEME_KEY) as Theme | null;
  return t === "light" || t === "ocean" || t === "nebula" ? t : "dark";
}

export function applyTheme(theme: Theme) {
  if (typeof document !== "undefined")
    document.documentElement.setAttribute("data-theme", theme);
}

const initialTheme = loadTheme();
applyTheme(initialTheme); // apply before first paint to avoid a theme flash

const initialUser = authService.loadUser();
const PAGE_KEY = "saas-page";
function loadPage(): string {
  if (typeof localStorage === "undefined") return "dashboard";
  return localStorage.getItem(PAGE_KEY) || "dashboard";
}

// Admin session flag — tracks whether the current authenticated session
// was established via the admin login flow. Persisted so a refresh keeps
// the correct routing (admin via /admin -> admin dashboard, admin via normal
// login -> normal dashboard).
const ADMIN_SESSION_KEYS = [
  "is_admin_session",
  "admin_session",
  "isAdminSession",
] as const;
function loadIsAdminSession(): boolean {
  if (typeof localStorage === "undefined") return false;
  for (const k of ADMIN_SESSION_KEYS) {
    if (localStorage.getItem(k) === "true") return true;
  }
  return false;
}
function persistIsAdminSession(isAdminSessionEnabled: boolean) {
  if (typeof localStorage === "undefined") return;
  for (const k of ADMIN_SESSION_KEYS) {
    if (isAdminSessionEnabled) localStorage.setItem(k, "true");
    else localStorage.removeItem(k);
  }
}
const initialIsAdminSession = loadIsAdminSession();

export interface IntegrationConfig {
  id: string;
  name: string;
  endpointUrl: string;
  resolution: string;
  refreshRate: number;
}

export interface WorkspaceEntityState {
  entityId: string;
  name: string;
  description: string;
  kind: "workspace" | "project";
  status: "active" | "trial" | "archived";
  ownerId: string;
  memberCount?: number;
  taskCount?: number;
  createdAt: string;
  updatedAt: string;
  integrations?: IntegrationConfig[];
}

// --- SaaS domain models (consistent prop naming) ---
export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "archived";
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  status: "active" | "invited" | "offline";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  projectId?: string;
}

export interface Analytics {
  totalProjects: number;
  completedTasks: number;
  activeTeamMembers: number;
  revenueGrowth: number;
  tasksCompletedOverTime: number[];
  revenueByProject: { projectName: string; revenue: number }[];
}

export type DashboardStats = Analytics;

export interface Activity {
  id: string;
  teamMemberId: string;
  teamMemberName: string;
  action: string;
  projectId: string | null;
  taskId: string | null;
  timestamp: string;
}

export interface Filters {
  status: string;
  priority: string;
  assigneeId: string;
  search: string;
}

const METRIC_HISTORY_LENGTH = 60;
const KPI_HISTORY_LEN = METRIC_HISTORY_LENGTH;

export type DashboardViewMode = "standard" | "analytics";
export type ViewportMode = DashboardViewMode;
export type RenderQuality = "low" | "med" | "high";

export type ToastKind = "info" | "success" | "warn" | "error";
export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  msg?: string;
  ttl: number; // ms before auto-dismiss (0 = sticky)
}
let toastSeq = 0;

export interface RenderSettings {
  bloom: boolean;
  ao: boolean; // ambient occlusion (SSAO)
  grid: boolean;
  shadows: boolean;
  labels: boolean;
  quality: RenderQuality;
}

interface SaaSStore {
  workspaceId: string;
  connected: boolean;

  // features loaded from the backend API
  dbFeatures: SaaSFeature[];
  setDbFeatures: (features: SaaSFeature[]) => void;
  workspaceEntities: Record<string, WorkspaceEntityState>;
  metrics: Record<string, number>;
  metricHistory: Record<string, number[]>;
  selectedWorkspaceEntityId: string | null;
  followSelected: boolean;

  // auth
  user: AuthUser | null;
  isAdminSession: boolean;
  authView: "login" | "register" | "admin";

  // transient UI feedback
  toasts: Toast[];
  cmdkOpen: boolean;

  // navigation
  page: string; // active feature page id (see features.ts)
  navCollapsed: boolean;

  // appearance
  theme: Theme;

  // dashboard / rendering (SaaS)
  dashboardViewMode: DashboardViewMode;
  render: RenderSettings;
  fps: number;
  simClock: number; // seconds of sim time elapsed (advances while connected)
  // live preview toggle — when true, SaaS dashboard renders live preview
  livePreviewEnabled: boolean;
  setLivePreviewEnabled: (shouldUseLivePreview: boolean) => void;

  pushToast: (toastNotification: Omit<Toast, "id" | "ttl"> & { ttl?: number }) => number;
  dismissToast: (toastId: number) => void;
  setCmdkOpen: (isCommandPaletteOpen: boolean) => void;
  setAuth: (
    authToken: string,
    refreshToken: string,
    authenticatedUser: AuthUser,
    isAdminSession?: boolean,
  ) => void;
  logout: () => void;
  setAuthView: (selectedAuthView: "login" | "register" | "admin") => void;
  setPage: (selectedPageId: string) => void;
  toggleNav: () => void;
  setWorkspaceId: (selectedWorkspaceId: string) => void;
  setConnected: (isConnected: boolean) => void;
  setSnapshot: (workspaceSnapshot: Record<string, WorkspaceEntityState>) => void;
  updateWorkspaceEntity: (workspaceEntityState: WorkspaceEntityState) => void;
  updateMetric: (metricName: string, metricValue: number) => void;
  selectWorkspaceEntity: (selectedWorkspaceEntityIdentifier: string | null) => void;
  setFollowSelected: (shouldFollowSelected: boolean) => void;
  setTheme: (selectedTheme: Theme) => void;
  setDashboardViewMode: (selectedDashboardViewMode: DashboardViewMode) => void;
  toggleRender: (renderKey: keyof Omit<RenderSettings, "quality">) => void;
  setQuality: (selectedQuality: RenderQuality) => void;
  setFps: (framesPerSecond: number) => void;
  tickClock: (deltaTime: number) => void;
  integrationConfigs: Record<string, IntegrationConfig[]>;
  integrationLoading: boolean;
  integrationError: string | null;
  fetchIntegrations: (selectedIntegrationType: string) => Promise<void>;

  // --- SaaS domain state (consistent naming across all pages) ---
  projects: Project[];
  selectedProject: Project | null;
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedTeamMember: TeamMember | null;
  notifications: Notification[];
  analytics: Analytics | null;
  activity: Activity[];
  dashboardStats: DashboardStats | null;
  searchQuery: string;
  filters: Filters;
  currentPage: number;
  isLoading: boolean;
  isSubmitting: boolean;

  setProjects: (projectList: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setTasks: (taskList: Task[]) => void;
  setTeamMembers: (teamMemberList: TeamMember[]) => void;
  setSelectedTeamMember: (teamMember: TeamMember | null) => void;
  setNotifications: (notificationList: Notification[]) => void;
  setAnalytics: (analyticsReport: Analytics | null) => void;
  setActivity: (activityFeed: Activity[]) => void;
  setDashboardStats: (stats: DashboardStats | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filterCriteria: Filters) => void;
  setCurrentPage: (pageNumber: number) => void;
  setIsLoading: (loadingState: boolean) => void;
  setIsSubmitting: (submittingState: boolean) => void;
}

export const useSaaSStore = create<SaaSStore>((set) => ({
  workspaceId: "demo",
  connected: false,
  dbFeatures: [],
  setDbFeatures: (dbFeatures) => set({ dbFeatures }),
  workspaceEntities: {},
  metrics: {},
  metricHistory: {},
  selectedWorkspaceEntityId: null,
  followSelected: false,

  user: initialUser,
  isAdminSession: initialIsAdminSession,
  authView: "login",

  toasts: [],
  cmdkOpen: false,

  page: loadPage(),
  navCollapsed: false,

  theme: initialTheme,

  dashboardViewMode: "standard",
  render: {
    bloom: true,
    ao: true,
    grid: true,
    shadows: true,
    labels: true,
    quality: "high",
  },
  fps: 0,
  simClock: 0,
  livePreviewEnabled: false,
  setLivePreviewEnabled: (shouldUseLivePreview) => set({ livePreviewEnabled: shouldUseLivePreview }),

  pushToast: ({ ttl = 4200, ...rest }: Omit<Toast, "id" | "ttl"> & { ttl?: number }) => {
    const toastId = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id: toastId, ttl, ...rest }] }));
    return toastId;
  },
  dismissToast: (toastId) =>
    set((s) => ({ toasts: s.toasts.filter((toastNotification) => toastNotification.id !== toastId) })),
  setCmdkOpen: (isCommandPaletteOpen) => set({ cmdkOpen: isCommandPaletteOpen }),
  setAuth: (authToken, refreshToken, authenticatedUser, isAdminSession = false) => {
    authService.persist(authToken, refreshToken, authenticatedUser);
    persistIsAdminSession(isAdminSession);
    set({ user: authenticatedUser, isAdminSession });
  },
  logout: () => {
    authService.clear();
    persistIsAdminSession(false);
    set({ user: null, isAdminSession: false, authView: "login" });
  },
  setAuthView: (selectedAuthView) => set({ authView: selectedAuthView }),
  setPage: (selectedPageId) => {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(PAGE_KEY, selectedPageId);
    set({ page: selectedPageId });
  },
  toggleNav: () => set((s) => ({ navCollapsed: !s.navCollapsed })),
  setWorkspaceId: (selectedWorkspaceId) =>
    set({
      workspaceId: selectedWorkspaceId,
      workspaceEntities: {},
      metrics: {},
      metricHistory: {},
      selectedWorkspaceEntityId: null,
      simClock: 0,
    }),
  setConnected: (isConnected) => set({ connected: isConnected }),
  setSnapshot: (workspaceSnapshot) => set({ workspaceEntities: workspaceSnapshot }),
  updateWorkspaceEntity: (workspaceEntityState) =>
    set((s) => {
      const previousWorkspaceEntityState = s.workspaceEntities[workspaceEntityState.entityId];
      const mergedWorkspaceEntityState = previousWorkspaceEntityState
        ? { ...previousWorkspaceEntityState, ...workspaceEntityState }
        : workspaceEntityState;
      if (!("integrations" in workspaceEntityState) && previousWorkspaceEntityState?.integrations) {
        mergedWorkspaceEntityState.integrations = previousWorkspaceEntityState.integrations;
      }
      if (!("description" in workspaceEntityState) && previousWorkspaceEntityState?.description) {
        mergedWorkspaceEntityState.description = previousWorkspaceEntityState.description;
      }
      return { workspaceEntities: { ...s.workspaceEntities, [workspaceEntityState.entityId]: mergedWorkspaceEntityState } };
    }),
  updateMetric: (metricName, metricValue) =>
    set((s) => {
      const previousMetricHistory = s.metricHistory[metricName] ?? [];
      const nextMetricHistory = [...previousMetricHistory, metricValue].slice(-METRIC_HISTORY_LENGTH);
      return {
        metrics: { ...s.metrics, [metricName]: metricValue },
        metricHistory: { ...s.metricHistory, [metricName]: nextMetricHistory },
      };
    }),
  selectWorkspaceEntity: (selectedWorkspaceEntityIdentifier) => set({ selectedWorkspaceEntityId: selectedWorkspaceEntityIdentifier }),
  setFollowSelected: (shouldFollowSelected) => set({ followSelected: shouldFollowSelected }),
  setTheme: (selectedTheme) => {
    if (typeof localStorage !== "undefined")
      localStorage.setItem(THEME_KEY, selectedTheme);
    applyTheme(selectedTheme);
    set({ theme: selectedTheme });
  },
  setDashboardViewMode: (selectedDashboardViewMode) => set({ dashboardViewMode: selectedDashboardViewMode }),
  toggleRender: (renderKey) =>
    set((s) => ({ render: { ...s.render, [renderKey]: !s.render[renderKey] } })),
  setQuality: (selectedQuality) => set((s) => ({ render: { ...s.render, quality: selectedQuality } })),
  setFps: (framesPerSecond) => set({ fps: framesPerSecond }),
  tickClock: (deltaTime) => set((s) => ({ simClock: s.simClock + deltaTime })),
  integrationConfigs: {},
  integrationLoading: false,
  integrationError: null,
  fetchIntegrations: async (selectedIntegrationType: string) => {
    const saasStoreState = useSaaSStore.getState();
    set({ integrationLoading: true, integrationError: null });
    try {
      const integrationResponse = await fetch(`/api/integrations/${selectedIntegrationType}`);
      if (!integrationResponse.ok) throw new Error(`${integrationResponse.status}`);
      const integrationApiResponse: { integrations: IntegrationConfig[] } = await integrationResponse.json();
      set({
        integrationConfigs: { ...saasStoreState.integrationConfigs, [selectedIntegrationType]: integrationApiResponse.integrations },
        integrationLoading: false,
      });
    } catch (integrationFetchError) {
      set({ integrationError: String(integrationFetchError), integrationLoading: false });
    }
  },

  // SaaS initial state
  projects: [],
  selectedProject: null,
  tasks: [],
  teamMembers: [],
  selectedTeamMember: null,
  notifications: [],
  analytics: null,
  activity: [],
  dashboardStats: null,
  searchQuery: "",
  filters: { status: "all", priority: "all", assigneeId: "all", search: "" },
  currentPage: 1,
  isLoading: false,
  isSubmitting: false,

  setProjects: (projectList) => set({ projects: projectList }),
  setSelectedProject: (project) => set({ selectedProject: project }),
  setTasks: (taskList) => set({ tasks: taskList }),
  setTeamMembers: (teamMemberList) => set({ teamMembers: teamMemberList }),
  setSelectedTeamMember: (teamMember) => set({ selectedTeamMember: teamMember }),
  setNotifications: (notificationList) => set({ notifications: notificationList }),
  setAnalytics: (analyticsReport) => set({ analytics: analyticsReport, dashboardStats: analyticsReport }),
  setActivity: (activityFeed) => set({ activity: activityFeed }),
  setDashboardStats: (stats) => set({ dashboardStats: stats, analytics: stats }),
  setSearchQuery: (query) => set({ searchQuery: query, filters: { ...useSaaSStore.getState().filters, search: query } }),
  setFilters: (filterCriteria) => set({ filters: filterCriteria }),
  setCurrentPage: (pageNumber) => set({ currentPage: pageNumber }),
  setIsLoading: (loadingState) => set({ isLoading: loadingState }),
  setIsSubmitting: (submittingState) => set({ isSubmitting: submittingState }),
}));
