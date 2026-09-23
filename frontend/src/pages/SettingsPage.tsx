import { useEffect, useState } from "react";
import { useSaaSStore, type TeamMember, type Notification, type Filters, type Theme } from "../store";
import { apiClient } from "../api/apiClient";
import { Settings, User, Bell, Shield, Save, Sun, Moon, Waves } from "lucide-react";

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
  onUpdate: (updatedSettings: SettingsFormState) => void;
}

function SettingsForm({ user, teamMember, notifications, filters, searchQuery, isSubmitting, isLoading, onUpdate }: SettingsPageProps) {
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

  if (isLoading) return <div style={{ padding: 16 }}>Loading settings…</div>;

  return (
    <form onSubmit={handleSettingsSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--auth-text-muted)", marginBottom: 6 }}>
          Display name
        </label>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <User size={16} style={{ position: "absolute", left: 10, color: "var(--auth-text-muted)" }} />
          <input
            value={settingsForm.displayName}
            onChange={(e) => handleSettingsFieldChange("displayName", e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: "10px 12px 10px 32px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--auth-input-bg)", color: "var(--text-h)" }}
          />
        </div>
        <div style={{ fontSize: 11, color: "var(--auth-text-muted)", marginTop: 4 }}>
          Role: {user?.role ?? teamMember?.role ?? "—"} • Search: {searchQuery || "—"} • Filter: {filters.status}
        </div>
      </div>

      <div style={{ padding: 14, borderRadius: 10, border: "1px solid var(--border)", background: "var(--code-bg)", display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text-h)" }}>
          <input
            type="checkbox"
            checked={settingsForm.emailNotificationsEnabled}
            onChange={(e) => handleSettingsFieldChange("emailNotificationsEnabled", e.target.checked)}
            style={{ accentColor: "var(--accent)" }}
          />
          <Bell size={16} /> Email notifications ({notifications.filter((notification) => !notification.read).length} unread)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text-h)" }}>
          <input
            type="checkbox"
            checked={settingsForm.weeklyAnalyticsDigestEnabled}
            onChange={(e) => handleSettingsFieldChange("weeklyAnalyticsDigestEnabled", e.target.checked)}
            style={{ accentColor: "var(--accent)" }}
          />
          <Shield size={16} /> Weekly analytics digest
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", cursor: "pointer", fontWeight: 700, alignSelf: "flex-start" }}
      >
        <Save size={16} /> {isSubmitting ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function ThemeSelector() {
  const theme = useSaaSStore((s) => s.theme);
  const setTheme = useSaaSStore((s) => s.setTheme);
  const pushToast = useSaaSStore((s) => s.pushToast);
  const options: Array<{ value: Theme; label: string; icon: typeof Sun; desc: string }> = [
    { value: "light", label: "Light", icon: Sun, desc: "Bright & clean" },
    { value: "dark", label: "Dark", icon: Moon, desc: "Easy on eyes" },
    { value: "ocean", label: "Ocean", icon: Waves, desc: "Cool blue" },
  ];
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text-h)]">Appearance</h3>
      <p className="mt-1 text-xs text-[var(--text)]">Choose your workspace theme — updates instantly and persists after refresh.</p>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--text-h)]"
                  : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]"
              }`}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${isActive ? "bg-[var(--accent)] text-white" : "bg-[var(--bg)] text-[var(--text)]"}`}>
                <opt.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-xs text-[var(--text)]">{opt.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
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

  const fetchSettings = async () => {
    try {
      const data: any = await apiClient("/api/settings");
      if (data.settings) {
        pushToast({ kind: "info", title: "Settings loaded", msg: "Settings fetched from server" });
      }
    } catch (e: any) {
      pushToast({ kind: "error", title: "Failed to load settings", msg: e.message });
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
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Settings size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Settings</h1>
      </div>
      <div className="mb-6 max-w-[480px]">
        <ThemeSelector />
      </div>
      <SettingsForm
        user={authenticatedUser}
        teamMember={selectedTeamMember}
        notifications={notifications}
        filters={filters}
        searchQuery={searchQuery}
        isSubmitting={isSubmitting}
        isLoading={isLoading}
        onUpdate={handleUpdateSettings}
      />
    </div>
  );
}
