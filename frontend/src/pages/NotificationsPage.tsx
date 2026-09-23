import { useEffect, useMemo, useState } from "react";
import { useSaaSStore, type Notification } from "../store";
import { apiClient } from "../api/apiClient";
import { Bell, Check, Trash2, AlertCircle } from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onUpdate: (notificationToUpdate: Notification) => void;
  onDelete: (notificationToDelete: Notification) => void;
}

function NotificationItem({ notification, onUpdate, onDelete }: NotificationItemProps) {
  return (
    <div
      style={{ display: "flex", gap: 12, padding: 14, borderRadius: 10, border: `1px solid ${notification.read ? "var(--border)" : "var(--accent-border)"}`, background: notification.read ? "var(--code-bg)" : "var(--accent-bg)", alignItems: "flex-start" }}
    >
      <div style={{ marginTop: 2 }}>
        {notification.type === "warning" ? <AlertCircle size={18} style={{ color: "var(--amber)" }} /> : notification.type === "error" ? <AlertCircle size={18} style={{ color: "var(--red)" }} /> : <Bell size={18} style={{ color: notification.read ? "var(--text)" : "var(--accent)" }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: "var(--text-h)", fontSize: 14 }}>{notification.title}</div>
        <div style={{ fontSize: 13, color: "var(--text)", marginTop: 2 }}>{notification.message}</div>
        <div style={{ fontSize: 11, color: "var(--auth-text-muted)", marginTop: 6 }}>{new Date(notification.createdAt).toLocaleString()}</div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {!notification.read && (
          <button
            onClick={() => onUpdate({ ...notification, read: true })}
            style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <Check size={12} /> Mark read
          </button>
        )}
        <button
          onClick={() => onDelete(notification)}
          style={{ padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg)", cursor: "pointer", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

interface NotificationsPageProps {
  notifications: Notification[];
  isLoading: boolean;
  onUpdate: (notificationToUpdate: Notification) => void;
  onDelete: (notificationToDelete: Notification) => void;
}

function NotificationsContent({ notifications, isLoading, onUpdate, onDelete }: NotificationsPageProps) {
  const unreadNotificationCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  if (isLoading) return <div style={{ padding: 16 }}>Loading notifications…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--auth-text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{notifications.length} total • {unreadNotificationCount} unread</span>
        {unreadNotificationCount > 0 && (
          <button
            onClick={async () => {
              try {
                await apiClient("/api/notifications/mark-all-read", {}, "POST");
                notifications.filter((n) => !n.read).forEach((unreadNotification) => onUpdate({ ...unreadNotification, read: true }));
              } catch {}
            }}
            style={{ border: "none", background: "transparent", color: "var(--accent)", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
          >
            Mark all read
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
        {notifications.length === 0 && <div style={{ textAlign: "center", color: "var(--auth-text-muted)", padding: 24 }}>No notifications.</div>}
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

  const fetchNotifications = async () => {
    setLocalLoading(true);
    setIsLoading(true);
    try {
      const data: any = await apiClient("/api/notifications");
      setNotifications(data.notifications ?? []);
    } catch (e: any) {
      pushToast({ kind: "error", title: "Failed to load notifications", msg: e.message });
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Bell size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Notifications</h1>
      </div>
      <NotificationsContent notifications={notifications} isLoading={isLoading} onUpdate={handleUpdateNotification} onDelete={handleDeleteNotification} />
    </div>
  );
}
