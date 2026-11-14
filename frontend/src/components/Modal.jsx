import { X } from "lucide-react";
import { useId } from "react";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

export default function Modal({ open, title, children, onClose, size = "max-w-xl" }) {
  const titleId = useId();
  const dialogRef = useModalAccessibility(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto bg-[#172e27]/40 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} tabIndex={-1} className={`vault-enter my-auto max-h-[calc(100vh-2rem)] w-full ${size} overflow-y-auto rounded-[16px] border border-[#ded8cb] bg-surface p-6 shadow-lift`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="font-display text-xl text-forest">{title}</h2>
          <button className="btn-icon" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}
