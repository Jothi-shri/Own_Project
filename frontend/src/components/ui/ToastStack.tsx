import { useSaaSStore } from "../../store";

export default function ToastStack() {
  const toastNotifications = useSaaSStore((s) => s.toasts);
  const dismissToastNotification = useSaaSStore((s) => s.dismissToast);
  if (toastNotifications.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toastNotifications.map((toastNotification) => (
        <div
          key={toastNotification.id}
          onClick={() => dismissToastNotification(toastNotification.id)}
          role="status"
          className={`pointer-events-auto min-w-[280px] max-w-[360px] rounded-[10px] border bg-[var(--code-bg)] p-3 text-sm shadow-[var(--shadow)] ${
            toastNotification.kind === "success"
              ? "border-[rgba(34,197,94,0.35)]"
              : toastNotification.kind === "error"
                ? "border-[rgba(239,68,68,0.35)]"
                : "border-[var(--accent-border)]"
          }`}
        >
          <div className="font-bold text-[var(--text-h)]">{toastNotification.title}</div>
          {toastNotification.msg && <div className="font-medium text-[var(--text)]">{toastNotification.msg}</div>}
        </div>
      ))}
    </div>
  );
}
