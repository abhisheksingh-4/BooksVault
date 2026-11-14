import { useEffect, useRef } from "react";

export function useModalAccessibility(open, onClose) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const focusableElements = () => [...(dialog?.querySelectorAll(focusableSelector) || [])];
    focusableElements()[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusableElements();
      if (!elements.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    dialog?.addEventListener("keydown", handleKeyDown);
    return () => {
      dialog?.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  return dialogRef;
}
