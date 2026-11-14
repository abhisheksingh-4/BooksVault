import { useCallback, useEffect, useState } from "react";
import { BookOpen, CircleDollarSign, Users, ArrowUpFromLine, FileBarChart } from "lucide-react";
import ErrorState from "../components/ErrorState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { dashboardService } from "../services/dashboardService";
import { errorMessage, formatCurrency } from "../utils/format";

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setReport(await dashboardService.reports()); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageHeader eyebrow="Insights" title="Reports" description="A snapshot of your library’s current activity." />
      {error && !report ? <div className="card"><ErrorState message={error} onRetry={load} /></div> : (
        <>
          {error && <div className="mb-5 rounded-[10px] border border-[#e7c7b9] bg-[#f7ebe5] px-4 py-3 text-sm text-error" role="alert">{error}</div>}
          {loading && !report ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="vault-panel h-32 animate-pulse bg-[#ebe6dc]" />)}</div> : (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total books" value={report?.total_books ?? "—"} note="Titles in catalog" icon={BookOpen} tone="blue" />
              <StatCard label="Active members" value={report?.active_members ?? "—"} note="Currently active" icon={Users} tone="cyan" />
              <StatCard label="Books issued" value={report?.books_issued ?? "—"} note="Currently checked out" icon={ArrowUpFromLine} tone="violet" />
              <StatCard label="Total fines" value={formatCurrency(report?.total_fines)} note="Fines recorded" icon={CircleDollarSign} tone="amber" />
            </section>
          )}
          <section className="vault-panel mt-6 flex items-start gap-4 p-5 sm:p-7">
            <div className="rounded-[10px] bg-[#e6ece5] p-3 text-forest"><FileBarChart size={20} /></div>
            <div><h2 className="font-display text-sm font-bold text-forest">About this report</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">These totals are provided by BooksVault’s reports endpoint and reflect the current library records. For recent circulation and overdue details, see the Library overview.</p></div>
          </section>
        </>
      )}
    </>
  );
}
