import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`modal-panel card w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--text-h)]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-[var(--text)]">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="icon-btn !h-8 !w-8 shrink-0">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
