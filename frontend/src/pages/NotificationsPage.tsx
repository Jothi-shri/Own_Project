import { useMemo } from "react";
import { useSaaSStore, type Notification } from "../store";
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

const mockNotifications: Notification[] = [
  { id: "n1", title: "New comment on Atlas CRM", message: "Alex Morgan commented: 'Looks great — let's ship'", type: "info", read: false, createdAt: new Date().toISOString(), projectId: "p1" },
  { id: "n2", title: "Task overdue", message: "Task 'Integrate billing webhook' is overdue by 2 days", type: "warning", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "n3", title: "Invite accepted", message: "Jamie Chen joined your team", type: "success", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

function NotificationsContent({ notifications, isLoading, onUpdate, onDelete }: NotificationsPageProps) {
  const unreadNotificationCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  if (isLoading) return <div style={{ padding: 16 }}>Loading notifications…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 12, color: "var(--auth-text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{notifications.length} total • {unreadNotificationCount} unread</span>
        {unreadNotificationCount > 0 && (
          <button
            onClick={() => notifications.filter((n) => !n.read).forEach((unreadNotification) => onUpdate({ ...unreadNotification, read: true }))}
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
  const isLoading = useSaaSStore((s) => s.isLoading);
  const setNotifications = useSaaSStore((s) => s.setNotifications);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const notificationList = notifications.length ? notifications : mockNotifications;

  const handleUpdateNotification: NotificationsPageProps["onUpdate"] = (notificationToUpdate) => {
    const updatedNotifications = notificationList.map((notification) => (notification.id === notificationToUpdate.id ? notificationToUpdate : notification));
    setNotifications(updatedNotifications);
    pushToast({ kind: "success", title: "Notification updated", msg: notificationToUpdate.title });
  };

  const handleDeleteNotification: NotificationsPageProps["onDelete"] = (notificationToDelete) => {
    setNotifications(notificationList.filter((notification) => notification.id !== notificationToDelete.id));
    pushToast({ kind: "warn", title: "Notification removed", msg: notificationToDelete.title });
  };

  return (
    <div style={{ padding: 32, textAlign: "left" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Bell size={28} style={{ color: "var(--accent)" }} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Notifications</h1>
      </div>
      <NotificationsContent notifications={notificationList} isLoading={isLoading} onUpdate={handleUpdateNotification} onDelete={handleDeleteNotification} />
    </div>
  );
}
