import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Search } from "lucide-react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import { dashboardService } from "../services/dashboardService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { errorMessage, formatCurrency, formatDateTime } from "../utils/format";

export default function FinesPage() {
  const [fines, setFines] = useState([]);
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setFines(await dashboardService.fines()); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const visible = useMemo(() => fines.filter((fine) => !search.trim() || `${fine.member_id} ${fine.amount} ${fine.paid}`.toLowerCase().includes(search.trim().toLowerCase())), [fines, search]);
  const total = visible.reduce((sum, fine) => sum + Number(fine.amount || 0), 0);

  return (
    <>
      <PageHeader eyebrow="Insights" title="Fines" description="Review recorded fines and collection history." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <article className="card flex items-center gap-4 p-5"><div className="rounded-2xl bg-amber-50 p-3 text-amber-600"><CircleDollarSign size={20} /></div><div><p className="text-xs font-semibold text-muted">Total in results</p><p className="mt-1 text-2xl font-extrabold text-ink">{formatCurrency(total)}</p></div></article>
        <article className="card flex items-center gap-4 p-5"><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600"><CircleDollarSign size={20} /></div><div><p className="text-xs font-semibold text-muted">Fine records</p><p className="mt-1 text-2xl font-extrabold text-ink">{visible.length}</p></div></article>
      </div>
      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4 sm:p-5">
          <div className="relative max-w-sm"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search member ID or amount…" /></div>
        </div>
        <DataTable
          columns={[
            { key: "id", label: "Fine ID", render: (fine) => <span className="font-mono text-xs font-semibold text-slate-500">#{fine.id}</span> },
            { key: "member_id", label: "Member", render: (fine) => <span className="font-semibold text-ink">Member #{fine.member_id}</span> },
            { key: "amount", label: "Amount", render: (fine) => <span className="font-semibold text-ink">{formatCurrency(fine.amount)}</span> },
            { key: "paid", label: "Status", render: (fine) => <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${fine.paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>{fine.paid ? "Paid" : "Unpaid"}</span> },
            { key: "created_at", label: "Recorded", render: (fine) => formatDateTime(fine.created_at) },
          ]}
          rows={visible}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No fines recorded"
          emptyDescription="Fine records will appear after overdue books are returned."
        />
      </section>
    </>
  );
}
