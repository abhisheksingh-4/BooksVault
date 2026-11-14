import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, BookOpen, CirclePlus, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import ConfirmDialog from "../components/ConfirmDialog";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import { bookService } from "../services/bookService";
import { catalogService } from "../services/catalogService";
import { useAuth } from "../context/AuthContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { errorMessage } from "../utils/format";

export default function BooksPage() {
  const { user } = useAuth();
  const canManage = ["admin", "librarian"].includes(user?.role);
  const [result, setResult] = useState({ items: [], total: 0 });
  const [lookups, setLookups] = useState({ authors: [], categories: [], publishers: [] });
  const [lookupError, setLookupError] = useState("");
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query);
  const [filters, setFilters] = useState({ category: "", author: "", publisher: "", available_only: false, sort_by: "title", sort_order: "asc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const requestVersion = useRef(0);

  const loadBooks = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      const params = { page, page_size: pageSize, sort_by: filters.sort_by, sort_order: filters.sort_order };
      if (search.trim()) params.search = search.trim();
      if (filters.category) params.category = filters.category;
      if (filters.author) params.author = filters.author;
      if (filters.publisher) params.publisher = filters.publisher;
      if (filters.available_only) params.available_only = true;
      const nextResult = await bookService.list(params);
      if (requestVersion.current === version) setResult(nextResult);
    } catch (requestError) {
      if (requestVersion.current === version) setError(errorMessage(requestError));
    } finally {
      if (requestVersion.current === version) setLoading(false);
    }
  }, [page, pageSize, search, filters]);

  useEffect(() => {
    Promise.all([
      catalogService.list("authors"),
      catalogService.list("categories"),
      catalogService.list("publishers"),
    ]).then(([authors, categories, publishers]) => setLookups({ authors, categories, publishers }))
      .catch((requestError) => setLookupError(errorMessage(requestError)));
  }, []);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const rows = useMemo(() => (result.items || []).map((book) => ({
    ...book,
    actions: (
      <div className="flex items-center justify-end gap-1">
        {canManage && book.available_quantity > 0 && <Link className="btn-icon text-emerald-600" to={`/issue?bookId=${book.id}`} title="Issue book"><BookOpen size={16} /></Link>}
        {canManage && book.available_quantity < book.quantity && <Link className="btn-icon text-amber-600" to={`/return?bookId=${book.id}`} title="Return book"><ArrowDownUp size={16} /></Link>}
        {canManage && <Link className="btn-icon" to={`/books/${book.id}/edit`} title="Edit book"><Pencil size={15} /></Link>}
        {canManage && <button className="btn-icon text-rose-500" title="Delete book" onClick={() => setPendingDelete(book)}><Trash2 size={15} /></button>}
      </div>
    ),
  })), [result.items, canManage]);

  const columns = [
    { key: "title", label: "Book", render: (book) => <div className="flex items-center gap-3"><div className="grid h-10 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600"><BookOpen size={17} /></div><div className="min-w-0"><p className="truncate font-semibold text-ink">{book.title}</p><p className="mt-0.5 text-xs text-slate-400">{book.isbn}</p></div></div> },
    { key: "author", label: "Author" },
    { key: "category", label: "Category", render: (book) => <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{book.category || "Uncategorized"}</span> },
    { key: "available_quantity", label: "Availability", render: (book) => <span className={`font-semibold ${book.available_quantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>{book.available_quantity} <span className="font-normal text-slate-400">/ {book.quantity}</span></span> },
    ...(canManage ? [{ key: "actions", label: "Actions", align: "right" }] : []),
  ];

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await bookService.remove(pendingDelete.id);
      toast.success("Book removed from the catalog");
      setPendingDelete(null);
      await loadBooks();
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  const changeFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Books"
        description="Search and manage the books in your library."
        action={canManage && <Link className="btn-primary" to="/books/new"><CirclePlus size={16} /> Add a book</Link>}
      />
      <section className="card overflow-hidden">
        {lookupError && <p className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-700">{lookupError} · Filters may be incomplete.</p>}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5">
          <div className="relative">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, ISBN, author, category, or publisher…" aria-label="Search books" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <select className="field" aria-label="Filter by category" value={filters.category} onChange={(event) => changeFilter("category", event.target.value)}>
              <option value="">All categories</option>{lookups.categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select className="field" aria-label="Filter by author" value={filters.author} onChange={(event) => changeFilter("author", event.target.value)}>
              <option value="">All authors</option>{lookups.authors.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <select className="field" aria-label="Filter by publisher" value={filters.publisher} onChange={(event) => changeFilter("publisher", event.target.value)}>
              <option value="">All publishers</option>{lookups.publishers.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600">
              <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={filters.available_only} onChange={(event) => changeFilter("available_only", event.target.checked)} />
              Available only
            </label>
            <select className="field" aria-label="Sort books" value={`${filters.sort_by}:${filters.sort_order}`} onChange={(event) => {
              const [sort_by, sort_order] = event.target.value.split(":");
              setFilters((current) => ({ ...current, sort_by, sort_order }));
              setPage(1);
            }}>
              <option value="title:asc">Title · A to Z</option>
              <option value="title:desc">Title · Z to A</option>
              <option value="created_at:desc">Recently added</option>
              <option value="available_quantity:desc">Most available</option>
              <option value="available_quantity:asc">Least available</option>
            </select>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={loadBooks}
          emptyTitle="No books found"
          emptyDescription={query ? "Try a different title, ISBN, or filter." : "Add your first book to start building the catalog."}
        />
        {!error && <Pagination page={page} pageSize={pageSize} total={result.total || 0} onPageChange={setPage} />}
        <div className="flex items-center justify-end border-t border-slate-100 px-5 py-3">
          <label className="flex items-center gap-2 text-xs text-muted">Rows per page
            <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              {[10, 20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this book?"
        description={`“${pendingDelete?.title || ""}” will be removed. Books with active issues cannot be deleted.`}
        confirmLabel="Delete book"
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
