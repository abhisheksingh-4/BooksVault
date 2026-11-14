import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ArrowUpFromLine, BookOpenCheck } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { bookService } from "../services/bookService";
import { memberService } from "../services/memberService";
import { errorMessage, formatDate } from "../utils/format";

export default function IssueBookPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { book_id: searchParams.get("bookId") || "", member_id: "", due_days: 14 } });
  const selectedBook = books.find((book) => String(book.id) === String(watch("book_id")));

  useEffect(() => {
    Promise.all([bookService.list({ page: 1, page_size: 100, available_only: true }), memberService.list()])
      .then(([bookResult, memberList]) => { setBooks(bookResult.items || []); setMembers(memberList); })
      .catch((error) => setLoadError(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (values) => {
    setSaving(true);
    try {
      const result = await bookService.issue(values.book_id, { member_id: Number(values.member_id), due_days: Number(values.due_days) });
      toast.success(`Book issued · due ${formatDate(result.due_date)}`);
      navigate("/books");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading checkout options" />;
  if (loadError) return <div className="card p-6 text-sm text-rose-600">{loadError}</div>;

  return (
    <>
      <PageHeader eyebrow="Circulation" title="Issue a book" description="Check out an available title to a library member." action={<Link className="btn-secondary" to="/books"><ArrowLeft size={15} /> Back to books</Link>} />
      <form className="card mx-auto max-w-2xl p-5 sm:p-8" onSubmit={handleSubmit(submit)}>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><ArrowUpFromLine size={18} /></div>
          <div><h2 className="text-sm font-bold text-ink">Checkout details</h2><p className="mt-0.5 text-xs text-muted">The due date is calculated from the selected loan period.</p></div>
        </div>
        <div className="space-y-5">
          <FormField
            as="select"
            label="Available book *"
            error={errors.book_id?.message}
            options={[{ value: "", label: "Choose a book" }, ...books.map((book) => ({ value: book.id, label: `${book.title} · ${book.available_quantity} available` }))]}
            {...register("book_id", { required: "Choose a book to issue" })}
          />
          {selectedBook && <div className="rounded-xl bg-brand-50 p-3.5 text-xs text-brand-800"><BookOpenCheck size={15} className="mr-2 inline" />{selectedBook.author || "Unknown author"} · ISBN {selectedBook.isbn}</div>}
          <FormField
            as="select"
            label="Member *"
            error={errors.member_id?.message}
            options={[{ value: "", label: "Choose a member" }, ...members.filter((member) => member.status === "active").map((member) => ({ value: member.id, label: `${member.name} · ${member.member_id}` }))]}
            {...register("member_id", { required: "Choose a member" })}
          />
          <FormField label="Loan period (days) *" type="number" min="1" max="90" error={errors.due_days?.message} {...register("due_days", { required: "Loan period is required", valueAsNumber: true, min: { value: 1, message: "Must be at least one day" } })} />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link className="btn-secondary" to="/books">Cancel</Link>
          <button className="btn-primary" type="submit" disabled={saving || !books.length}>{saving ? "Issuing…" : <><ArrowUpFromLine size={16} /> Issue book</>}</button>
        </div>
        {!books.length && <p className="mt-4 text-center text-xs text-amber-600">No books are currently available to issue.</p>}
      </form>
    </>
  );
}
