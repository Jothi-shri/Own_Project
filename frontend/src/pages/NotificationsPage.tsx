import { useEffect, useMemo, useState } from "react";
import { useSaaSStore, type Notification } from "../store";
import { apiClient } from "../api/apiClient";
import { Bell, Check, CheckCheck, Trash2, AlertCircle, Info } from "lucide-react";
import { PageHeader, Card, Reveal, EmptyState, LoadingState, ErrorState } from "../components/ui/primitives";

const TYPE_META: Record<Notification["type"], { icon: typeof Bell; badge: string; tile: string }> = {
  info: { icon: Info, badge: "badge-info", tile: "bg-[var(--info-bg)] text-[var(--info)]" },
  success: { icon: Check, badge: "badge-success", tile: "bg-[var(--success-bg)] text-[var(--success)]" },
  warning: { icon: AlertCircle, badge: "badge-warning", tile: "bg-[var(--warning-bg)] text-[var(--warning)]" },
  error: { icon: AlertCircle, badge: "badge-danger", tile: "bg-[var(--danger-bg)] text-[var(--danger)]" },
};

interface NotificationItemProps {
  notification: Notification;
  onUpdate: (notificationToUpdate: Notification) => void;
  onDelete: (notificationToDelete: Notification) => void;
}

function NotificationItem({ notification, onUpdate, onDelete }: NotificationItemProps) {
  const meta = TYPE_META[notification.type] ?? TYPE_META.info;
  const Icon = meta.icon;
  return (
    <Reveal>
      <div
        className={`card card-hover p-4 transition ${
          notification.read ? "" : "!border-[var(--accent-border)] shadow-[var(--shadow-sm)]"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.tile}`}>
            <Icon size={17} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[var(--text-h)]">{notification.title}</span>
              {!notification.read && <span className="badge badge-accent">New</span>}
              <span className={`badge ${meta.badge}`}>{notification.type}</span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--text)]">{notification.message}</p>
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{new Date(notification.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {!notification.read && (
              <button
                onClick={() => onUpdate({ ...notification, read: true })}
                className="btn btn-secondary !px-2.5 !py-2 text-xs"
                title="Mark as read"
              >
                <Check size={13} aria-hidden /> <span className="hidden sm:inline">Read</span>
              </button>
            )}
            <button
              onClick={() => onDelete(notification)}
              aria-label={`Delete ${notification.title}`}
              title="Delete"
              className="icon-btn !h-9 !w-9 hover:!border-[var(--danger-bg)] hover:!bg-[var(--danger-bg)] hover:!text-[var(--danger)]"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

interface NotificationsPageProps {
  notifications: Notification[];
  isLoading: boolean;
  fetchError: string | null;
  onUpdate: (notificationToUpdate: Notification) => void;
  onDelete: (notificationToDelete: Notification) => void;
  onRetry: () => void;
}

function NotificationsContent({ notifications, isLoading, fetchError, onUpdate, onDelete, onRetry }: NotificationsPageProps) {
  const unreadNotificationCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  if (isLoading) return <LoadingState message="Loading notifications…" rows={4} />;

  if (fetchError) return <ErrorState message={fetchError} onRetry={onRetry} />;

  return (
    <div className="flex flex-col gap-3">
      <Card className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-xs font-medium text-[var(--text-muted)]">
          <strong className="text-[var(--text-h)]">{notifications.length}</strong> total ·{" "}
          <strong className="text-[var(--text-h)]">{unreadNotificationCount}</strong> unread
        </p>
        {unreadNotificationCount > 0 && (
          <button
            onClick={async () => {
              try {
                await apiClient("/api/notifications/mark-all-read", {}, "POST");
                notifications.filter((n) => !n.read).forEach((unreadNotification) => onUpdate({ ...unreadNotification, read: true }));
              } catch {}
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--accent-bg)]"
          >
            <CheckCheck size={14} aria-hidden /> Mark all read
          </button>
        )}
      </Card>
      <div className="flex flex-col gap-2.5">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {notifications.length === 0 && (
          <Card>
            <EmptyState
              icon={<Bell className="h-5 w-5" aria-hidden />}
              title="All caught up"
              message="No notifications right now. We'll let you know when something needs attention."
            />
          </Card>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const notifications = useSaaSStore((s) => s.notifications);
  const setNotifications = useSaaSStore((s) => s.setNotifications);
  const setIsLoading = useSaaSStore((s) => s.setIsLoading);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [isLoading, setLocalLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    setFetchError(null);
    try {
      const data: any = await apiClient("/api/notifications");
      setNotifications(data.notifications ?? []);
    } catch (e: any) {
      const message = e?.message || "Unable to load notifications from the database.";
      setFetchError(message);
      pushToast({ kind: "error", title: "Failed to load notifications", msg: message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleUpdateNotification: NotificationsPageProps["onUpdate"] = async (notificationToUpdate) => {
    try {
      const data: any = await apiClient(`/api/notifications/${notificationToUpdate.id}`, { read: notificationToUpdate.read }, "PUT");
      const updated: Notification = data.notification;
      setNotifications(notifications.map((notification) => (notification.id === updated.id ? updated : notification)));
      pushToast({ kind: "success", title: "Notification updated", msg: updated.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Update failed", msg: e.message });
    }
  };

  const handleDeleteNotification: NotificationsPageProps["onDelete"] = async (notificationToDelete) => {
    try {
      await apiClient(`/api/notifications/${notificationToDelete.id}`, undefined, "DELETE");
      setNotifications(notifications.filter((notification) => notification.id !== notificationToDelete.id));
      pushToast({ kind: "warn", title: "Notification removed", msg: notificationToDelete.title });
    } catch (e: any) {
      pushToast({ kind: "error", title: "Delete failed", msg: e.message });
    }
  };

  return (
    <div className="page-wrap">
      <div className="mx-auto max-w-[900px]">
        <PageHeader
          eyebrow="Inbox"
          title="Notifications"
          description="Mentions, updates and alerts across your workspace."
          actions={unread > 0 ? <span className="badge badge-accent">{unread} unread</span> : undefined}
        />
        <div className="mt-5">
          <NotificationsContent notifications={notifications} isLoading={isLoading} fetchError={fetchError} onUpdate={handleUpdateNotification} onDelete={handleDeleteNotification} onRetry={fetchNotifications} />
        </div>
      </div>
    </div>
  );
}
