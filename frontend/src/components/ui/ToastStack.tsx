import { useSaaSStore } from "../../store";
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from "lucide-react";

const KIND_STYLE: Record<string, { icon: typeof Info; bar: string }> = {
  success: { icon: CheckCircle2, bar: "bg-emerald-500" },
  error: { icon: XCircle, bar: "bg-red-500" },
  warn: { icon: TriangleAlert, bar: "bg-amber-500" },
  info: { icon: Info, bar: "bg-[var(--accent)]" },
};

export default function ToastStack() {
  const toastNotifications = useSaaSStore((s) => s.toasts);
  const dismissToastNotification = useSaaSStore((s) => s.dismissToast);
  if (toastNotifications.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" role="region" aria-label="Notifications">
      {toastNotifications.map((toastNotification) => {
        const style = KIND_STYLE[toastNotification.kind] ?? KIND_STYLE["info"]!;
        const Icon = style.icon;
        return (
          <div
            key={toastNotification.id}
            onClick={() => dismissToastNotification(toastNotification.id)}
            role="status"
            className="toast-item pointer-events-auto overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)]"
          >
            <div className="flex items-start gap-3 p-3.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--accent)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[var(--text-h)]">{toastNotification.title}</div>
                {toastNotification.msg && <div className="mt-0.5 text-[13px] leading-snug text-[var(--text)]">{toastNotification.msg}</div>}
              </div>
              <button
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-h)]"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissToastNotification(toastNotification.id);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className={`h-0.5 w-full ${style.bar}`} />
          </div>
        );
      })}
    </div>
  );
}
