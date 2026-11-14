import { AlertTriangle } from "lucide-react";
import { useId } from "react";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

export default function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", busy = false, onCancel, onConfirm, danger = true }) {
  const titleId = useId();
  const dialogRef = useModalAccessibility(open, () => !busy && onCancel());
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172e27]/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <div ref={dialogRef} tabIndex={-1} className="vault-enter w-full max-w-md rounded-[16px] border border-[#ded8cb] bg-surface p-6 shadow-lift" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={`mb-4 inline-flex rounded-[10px] p-3 ${danger ? "bg-[#f2e5df] text-error" : "bg-[#e6ece5] text-forest"}`}><AlertTriangle size={20} /></div>
        <h2 id={titleId} className="font-display text-xl text-forest">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" disabled={busy} onClick={onCancel}>Cancel</button>
          <button className={danger ? "inline-flex items-center gap-2 rounded-[9px] bg-error px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8d3932] active:translate-y-px disabled:opacity-50" : "btn-primary"} disabled={busy} onClick={onConfirm}>
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
