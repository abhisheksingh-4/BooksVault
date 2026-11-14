import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pageSize, total, onPageChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col gap-3 border-t border-[#ded8cb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">Showing <span className="font-semibold text-ink">{start}–{end}</span> of <span className="font-semibold text-ink">{total}</span></p>
      <div className="flex items-center gap-2">
        <button className="btn-icon border border-[#ded8cb] disabled:opacity-40" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
        <span className="min-w-20 text-center font-mono text-[10px] text-muted">Page {page} of {pages}</span>
        <button className="btn-icon border border-[#ded8cb] disabled:opacity-40" aria-label="Next page" disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
