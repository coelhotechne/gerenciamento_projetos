import { useEffect } from "react";
import { X } from "lucide-react";

export default function Drawer({ open, onClose, title, subtitle, children, headerExtra }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border)" }}>
          <div className="u-between">
            <div>
              <h3 style={{ fontSize: 16 }}>{title}</h3>
              {subtitle && (
                <p className="u-muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
          {headerExtra}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}
