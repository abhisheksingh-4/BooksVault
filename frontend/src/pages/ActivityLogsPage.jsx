import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";
import { dashboardService } from "../services/dashboardService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { errorMessage, formatDateTime } from "../utils/format";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setLogs(await dashboardService.activity()); }
    catch (requestError) { setError(errorMessage(requestError)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const visible = useMemo(() => logs.filter((log) => !search.trim() || `${log.action} ${log.entity_type} ${log.details} ${log.user_id}`.toLowerCase().includes(search.trim().toLowerCase())), [logs, search]);
  return (
    <>
      <PageHeader eyebrow="Insights" title="Activity log" description="A chronological record of library operations." />
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-10" placeholder="Search activities…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <span className="flex items-center gap-1.5 text-xs text-muted"><Activity size={14} /> {visible.length} events</span>
        </div>
        <DataTable
          columns={[
            { key: "action", label: "Activity", render: (log) => <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Activity size={16} /></span><div><p className="font-semibold capitalize text-ink">{log.action} {log.entity_type}</p><p className="mt-0.5 max-w-lg truncate text-xs text-slate-400">{log.details}</p></div></div> },
            { key: "user_id", label: "User", render: (log) => log.user_id ? `User #${log.user_id}` : "System" },
            { key: "created_at", label: "Date & time", render: (log) => formatDateTime(log.created_at) },
          ]}
          rows={visible}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No activity to show"
          emptyDescription="Library actions will appear here as they happen."
        />
      </section>
    </>
  );
}
