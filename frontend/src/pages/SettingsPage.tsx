import { useEffect, useState } from "react";
import { useSaaSStore, type TeamMember, type Notification, type Filters, type Theme } from "../store";
import { apiClient } from "../api/apiClient";
import { User, Bell, Shield, Save, Sun, Moon, Waves, Check } from "lucide-react";
import { PageHeader, Card, CardHeader, Reveal, LoadingState } from "../components/ui/primitives";

interface SettingsFormState {
  displayName: string;
  emailNotificationsEnabled: boolean;
  weeklyAnalyticsDigestEnabled: boolean;
}

interface SettingsPageProps {
  user: { name: string; email: string; role: string } | null;
  teamMember: TeamMember | null;
  notifications: Notification[];
  filters: Filters;
  searchQuery: string;
  isSubmitting: boolean;
  isLoading: boolean;
  loadError: string | null;
  onUpdate: (updatedSettings: SettingsFormState) => void;
  onRetryLoad: () => void;
}

function SettingsForm({ user, teamMember, notifications, isSubmitting, isLoading, loadError, onUpdate, onRetryLoad }: SettingsPageProps) {
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>({
    displayName: user?.name ?? teamMember?.name ?? "",
    emailNotificationsEnabled: true,
    weeklyAnalyticsDigestEnabled: true,
  });

  const handleSettingsFieldChange = (fieldName: keyof SettingsFormState, fieldValue: string | boolean) => {
    setSettingsForm((previousSettings) => ({ ...previousSettings, [fieldName]: fieldValue } as SettingsFormState));
  };

  const handleSettingsSubmit = (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    onUpdate(settingsForm);
  };

  if (isLoading) return <LoadingState message="Loading settings…" rows={3} />;

  const unread = notifications.filter((notification) => !notification.read).length;

  return (
    <Card hover>
      <CardHeader title="Profile" subtitle={`${user?.role ?? teamMember?.role ?? "Member"} · ${user?.email ?? teamMember?.email ?? ""}`} />
      {loadError && (
        <div className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] px-3.5 py-2.5 text-[13px] font-medium text-[var(--auth-error-text)] sm:mx-5" role="alert">
          <span>{loadError}</span>
          <button onClick={onRetryLoad} className="btn btn-secondary shrink-0 !py-1.5 text-xs">
            Retry
          </button>
        </div>
      )}
      <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-5 p-4 sm:p-5">
        <div>
          <label htmlFor="settings-name" className="field-label">
            Display name
          </label>
          <div className="relative flex items-center">
            <User size={16} className="pointer-events-none absolute left-3.5 text-[var(--text-muted)]" aria-hidden />
            <input
              id="settings-name"
              value={settingsForm.displayName}
              onChange={(e) => handleSettingsFieldChange("displayName", e.target.value)}
              placeholder="Your name"
              className="input !pl-10"
            />
          </div>
        </div>

        <div className="card-sunken flex flex-col gap-1 p-2">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--accent-bg)]">
            <input
              type="checkbox"
              checked={settingsForm.emailNotificationsEnabled}
              onChange={(e) => handleSettingsFieldChange("emailNotificationsEnabled", e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--info-bg)] text-[var(--info)]">
              <Bell size={15} aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[var(--text-h)]">Email notifications</span>
              <span className="block text-xs text-[var(--text-muted)]">{unread} unread in your inbox</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-[var(--accent-bg)]">
            <input
              type="checkbox"
              checked={settingsForm.weeklyAnalyticsDigestEnabled}
              onChange={(e) => handleSettingsFieldChange("weeklyAnalyticsDigestEnabled", e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success-bg)] text-[var(--success)]">
              <Shield size={15} aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-[var(--text-h)]">Weekly analytics digest</span>
              <span className="block text-xs text-[var(--text-muted)]">A Monday summary of momentum</span>
            </span>
          </label>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-primary self-start">
          <Save size={16} aria-hidden /> {isSubmitting ? "Saving…" : "Save settings"}
        </button>
      </form>
    </Card>
  );
}

function ThemeSelector() {
  const theme = useSaaSStore((s) => s.theme);
  const setTheme = useSaaSStore((s) => s.setTheme);
  const pushToast = useSaaSStore((s) => s.pushToast);
  const options: Array<{ value: Theme; label: string; icon: typeof Sun; desc: string; swatch: string }> = [
    { value: "light", label: "Light", icon: Sun, desc: "Warm paper, indigo ink", swatch: "linear-gradient(135deg,#fdfdfb 55%,#4f46e5 55%)" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Deep slate, sky accent", swatch: "linear-gradient(135deg,#0c1220 55%,#38bdf8 55%)" },
    { value: "ocean", label: "Ocean", icon: Waves, desc: "Deep teal, cyan glow", swatch: "linear-gradient(135deg,#06222e 55%,#22d3ee 55%)" },
  ];
  return (
    <Card hover>
      <CardHeader title="Appearance" subtitle="Instant preview — saved automatically across visits" />
      <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-3 sm:p-5">
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                pushToast({ kind: "success", title: `${opt.label} theme`, msg: `Switched to ${opt.label}` });
              }}
              aria-pressed={isActive}
              aria-label={`Select ${opt.label} theme`}
              className={`group card-hover flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-bg)] shadow-[var(--shadow-sm)]"
                  : "border-[var(--border)] bg-[var(--surface-2)]/40 hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-sm)]"
              }`}
            >
              <span
                className="h-10 w-10 shrink-0 rounded-xl border border-[var(--border)]"
                style={{ background: opt.swatch }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--text-h)]">
                  <opt.icon className="h-3.5 w-3.5" aria-hidden /> {opt.label}
                  {isActive && <Check size={14} className="text-[var(--accent)]" aria-hidden />}
                </span>
                <span className="block truncate text-xs text-[var(--text-muted)]">{opt.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const authenticatedUser = useSaaSStore((s) => s.user);
  const selectedTeamMember = useSaaSStore((s) => s.selectedTeamMember);
  const notifications = useSaaSStore((s) => s.notifications);
  const filters = useSaaSStore((s) => s.filters);
  const searchQuery = useSaaSStore((s) => s.searchQuery);
  const isSubmitting = useSaaSStore((s) => s.isSubmitting);
  const isLoading = useSaaSStore((s) => s.isLoading);
  const setIsSubmitting = useSaaSStore((s) => s.setIsSubmitting);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [settingsLoadError, setSettingsLoadError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setSettingsLoadError(null);
    try {
      const data: any = await apiClient("/api/settings");
      if (data.settings) {
        pushToast({ kind: "info", title: "Settings loaded", msg: "Settings fetched from server" });
      }
    } catch (e: any) {
      const message = e?.message || "Unable to load settings from the database.";
      setSettingsLoadError(message);
      pushToast({ kind: "error", title: "Failed to load settings", msg: message });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdateSettings: SettingsPageProps["onUpdate"] = async (updatedSettings) => {
    setIsSubmitting(true);
    try {
      await apiClient("/api/settings", updatedSettings, "PUT");
      pushToast({ kind: "success", title: "Settings saved", msg: `Updated ${updatedSettings.displayName}` });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Save failed", msg: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[720px]">
        <PageHeader
          eyebrow="Workspace"
          title="Settings"
          description="Your profile, notifications and the look of your workspace."
        />
        <div className="mt-5 flex flex-col gap-4">
          <Reveal>
            <ThemeSelector />
          </Reveal>
          <Reveal delay={80}>
            <SettingsForm
              user={authenticatedUser}
              teamMember={selectedTeamMember}
              notifications={notifications}
              filters={filters}
              searchQuery={searchQuery}
              isSubmitting={isSubmitting}
              isLoading={isLoading}
              loadError={settingsLoadError}
              onUpdate={handleUpdateSettings}
              onRetryLoad={fetchSettings}
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
