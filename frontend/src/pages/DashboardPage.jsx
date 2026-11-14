import { useCallback, useEffect, useState } from "react";
import {
  Activity, ArrowDownToLine, ArrowUpFromLine, BookOpen, BookOpenCheck,
  CircleDollarSign, Clock3, Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import DataTable from "../components/DataTable";
import ErrorState from "../components/ErrorState";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import { dashboardService } from "../services/dashboardService";
import { errorMessage, formatDate, formatCurrency } from "../utils/format";

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOverview(await dashboardService.dashboard());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const cards = overview ? [
    { label: "Collection", value: overview.total_books, note: "Titles in the catalogue", icon: BookOpen, tone: "blue" },
    { label: "Ready to lend", value: overview.available_books, note: "Available now", icon: BookOpenCheck, tone: "emerald" },
    { label: "In circulation", value: overview.issued_books, note: "Currently checked out", icon: ArrowUpFromLine, tone: "violet" },
    { label: "Members", value: overview.active_members, note: "Active accounts", icon: Users, tone: "cyan" },
    { label: "Past due", value: overview.overdue_books, note: "Books awaiting return", icon: Clock3, tone: "rose" },
    { label: "Fines collected", value: formatCurrency(overview.fine_collected), note: "Collected to date", icon: CircleDollarSign, tone: "amber" },
  ] : [];
  const topBooks = overview?.top_borrowed_books || [];
  const maxBorrowCount = Math.max(1, ...topBooks.map((book) => Number(book.borrow_count) || 0));

  if (error && !overview) {
    return (
      <>
        <PageHeader eyebrow="BooksVault / Operations" title="Library overview" description="A clear view of your collection and its circulation." />
        <div className="vault-panel"><ErrorState message={error} onRetry={load} /></div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="BooksVault / Operations"
        title="Library overview"
        description="The collection, the movement, and the details that need attention."
        action={(
          <div className="flex flex-wrap gap-2">
            <Link to="/books" className="btn-secondary"><BookOpen size={15} /> Browse catalogue</Link>
            <Link to="/issue" className="btn-primary"><ArrowUpFromLine size={15} /> Issue a book</Link>
          </div>
        )}
      />
      {loading && !overview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="vault-panel h-[118px] animate-pulse bg-[#ebe6dc]" />)}
        </div>
      ) : (
        <>
          {error && <div className="mb-5 rounded-[10px] border border-[#e7c7b9] bg-[#f7ebe5] px-4 py-3 text-sm text-error" role="alert">{error}</div>}
          <section aria-label="Library statistics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((item) => <StatCard key={item.label} {...item} />)}
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
            <article className="vault-panel min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ded8cb] px-5 py-4">
                <div>
                  <p className="vault-kicker">01 / Circulation</p>
                  <h2 className="mt-1 font-display text-xl text-forest">Recent issues</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#e6ece5] text-forest"><ArrowUpFromLine size={16} /></span>
              </div>
              <DataTable
                columns={[
                  { key: "book_title", label: "Book", render: (row) => <span className="font-semibold text-forest">{row.book_title || "Unknown book"}</span> },
                  { key: "member_name", label: "Member", render: (row) => row.member_name || "—" },
                  { key: "issue_date", label: "Issued", render: (row) => formatDate(row.issue_date) },
                  { key: "due_date", label: "Due", render: (row) => formatDate(row.due_date) },
                ]}
                rows={overview?.recent_issues || []}
                loading={false}
                emptyTitle="No recent issues"
                emptyDescription="New checkouts will appear here."
              />
            </article>
            <article className="vault-panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="vault-kicker">02 / Collection pulse</p>
                  <h2 className="mt-1 font-display text-xl text-forest">Top borrowed books</h2>
                  <p className="mt-1 text-xs text-muted">Most active titles in the library records</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#eee8dc] text-[#7d694f]"><Activity size={16} /></span>
              </div>
              {topBooks.length ? (
                <ol className="mt-6 space-y-5">
                  {topBooks.map((book, index) => {
                    const count = Number(book.borrow_count) || 0;
                    return (
                      <li key={book.book_id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="font-mono text-[10px] text-copper">{String(index + 1).padStart(2, "0")}</span>
                            <span className="truncate text-xs font-semibold text-ink">{book.title}</span>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] text-muted">{count} loans</span>
                        </div>
                        <div className="h-[5px] overflow-hidden rounded-full bg-[#e9e4d9]">
                          <div className="h-full rounded-full bg-forest transition-[width] duration-500" style={{ width: `${(count / maxBorrowCount) * 100}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <div className="mt-4"><p className="py-8 text-center text-sm text-muted">Borrowing activity will appear when books have been issued.</p></div>
              )}
            </article>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-2">
            <article className="vault-panel min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ded8cb] px-5 py-4">
                <div>
                  <p className="vault-kicker">03 / Back on the shelf</p>
                  <h2 className="mt-1 font-display text-xl text-forest">Recent returns</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#e4ece4] text-success"><ArrowDownToLine size={16} /></span>
              </div>
              <DataTable
                columns={[
                  { key: "book_title", label: "Book", render: (row) => <span className="font-semibold text-forest">{row.book_title || "Unknown book"}</span> },
                  { key: "member_name", label: "Member" },
                  { key: "return_date", label: "Returned", render: (row) => formatDate(row.return_date) },
                ]}
                rows={overview?.recent_returns || []}
                loading={false}
                emptyTitle="No recent returns"
                emptyDescription="Completed returns will appear here."
              />
            </article>
            <article className="vault-panel min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#ded8cb] px-5 py-4">
                <div>
                  <p className="vault-kicker">04 / Needs attention</p>
                  <h2 className="mt-1 font-display text-xl text-forest">Overdue members</h2>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#f2e5df] text-error"><Clock3 size={16} /></span>
              </div>
              <DataTable
                columns={[
                  { key: "name", label: "Member", render: (row) => <><span className="font-semibold text-forest">{row.name}</span><span className="mt-0.5 block text-xs text-muted">{row.email}</span></> },
                  { key: "overdue_count", label: "Overdue", render: (row) => <span className="rounded-full bg-[#f2e5df] px-2.5 py-1 font-mono text-[10px] text-error">{row.overdue_count} books</span> },
                  { key: "oldest_due_date", label: "Since", render: (row) => formatDate(row.oldest_due_date) },
                ]}
                rows={overview?.overdue_members || []}
                loading={false}
                emptyTitle="You’re all caught up"
                emptyDescription="There are no overdue members right now."
              />
            </article>
          </section>
        </>
      )}
    </>
  );
}
