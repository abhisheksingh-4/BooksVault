import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Eye, Pencil, Plus, Search, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import { memberService } from "../services/memberService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { errorMessage, formatDate, formatCurrency } from "../utils/format";

const pageSize = 10;

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [historyMember, setHistoryMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setMembers(await memberService.list());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return members.filter((member) => !term || [member.name, member.email, member.member_id, member.phone].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [members, search]);
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openHistory = async (member) => {
    setHistoryMember(member);
    setHistory([]);
    setHistoryError("");
    setHistoryLoading(true);
    try {
      setHistory(await memberService.history(member.id));
    } catch (requestError) {
      setHistoryError(errorMessage(requestError));
    } finally {
      setHistoryLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await memberService.remove(pendingDelete.id);
      toast.success("Member removed");
      setPendingDelete(null);
      await load();
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  const rows = visible.map((member) => ({
    ...member,
    actions: (
      <div className="flex items-center justify-end gap-1">
        <button className="btn-icon text-brand-600" title="Borrow history" onClick={() => openHistory(member)}><BookMarked size={16} /></button>
        <Link className="btn-icon" to={`/members/${member.id}/edit`} title="Edit member"><Pencil size={15} /></Link>
        <button className="btn-icon text-rose-500" title="Delete member" onClick={() => setPendingDelete(member)}><Trash2 size={15} /></button>
      </div>
    ),
  }));

  return (
    <>
      <PageHeader eyebrow="People" title="Members" description="Manage your community and their borrowing history." action={<Link className="btn-primary" to="/members/new"><Plus size={16} /> Add member</Link>} />
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" placeholder="Search name, email, or member ID…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} aria-label="Search members" />
          </div>
          <span className="text-xs text-muted">{filtered.length} {filtered.length === 1 ? "member" : "members"}</span>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Member", render: (member) => <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserRound size={17} /></div><div><p className="font-semibold text-ink">{member.name}</p><p className="mt-0.5 text-xs text-slate-400">{member.email}</p></div></div> },
            { key: "member_id", label: "Member ID", render: (member) => <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-600">{member.member_id}</span> },
            { key: "phone", label: "Phone" },
            { key: "status", label: "Status", render: (member) => <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${member.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{member.status}</span> },
            { key: "actions", label: "Actions", align: "right" },
          ]}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No members found"
          emptyDescription={query ? "Try another name, email, or member ID." : "Create a member record to get started."}
        />
        {!error && <Pagination page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} />}
      </section>

      <Modal open={Boolean(historyMember)} title={`Borrow history · ${historyMember?.name || ""}`} onClose={() => setHistoryMember(null)} size="max-w-3xl">
        {historyLoading ? <div className="py-12 text-center text-sm text-muted">Loading borrowing history…</div>
          : historyError ? <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600">{historyError}</div>
            : history.length ? (
              <div className="max-h-[60vh] overflow-auto">
                <DataTable
                  columns={[
                    { key: "book_title", label: "Book", render: (item) => <span className="font-semibold text-ink">{item.book_title || `Book #${item.book_id}`}</span> },
                    { key: "issue_date", label: "Issued", render: (item) => formatDate(item.issue_date) },
                    { key: "due_date", label: "Due", render: (item) => formatDate(item.due_date) },
                    { key: "return_date", label: "Returned", render: (item) => formatDate(item.return_date) },
                    { key: "status", label: "Status" },
                    { key: "fine_amount", label: "Fine", render: (item) => formatCurrency(item.fine_amount) },
                  ]}
                  rows={history}
                />
              </div>
            ) : <div className="py-12 text-center text-sm text-muted"><Eye size={20} className="mx-auto mb-2 text-slate-300" />No borrowing history yet.</div>}
      </Modal>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove this member?"
        description={`The record for ${pendingDelete?.name || "this member"} will be removed. Members with active borrowed books cannot be deleted.`}
        confirmLabel="Delete member"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
