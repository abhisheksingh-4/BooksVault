import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowDownToLine, ArrowLeft, RotateCcw } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { bookService } from "../services/bookService";
import { memberService } from "../services/memberService";
import { errorMessage, formatCurrency } from "../utils/format";

export default function ReturnBookPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { book_id: searchParams.get("bookId") || "", member_id: "" } });
  const selectedBook = books.find((book) => String(book.id) === String(watch("book_id")));

  useEffect(() => {
    Promise.all([bookService.list({ page: 1, page_size: 100 }), memberService.list()])
      .then(([bookResult, memberList]) => { setBooks(bookResult.items || []); setMembers(memberList); })
      .catch((error) => setLoadError(errorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (values) => {
    setSaving(true);
    try {
      const result = await bookService.returnBook(values.book_id, { member_id: Number(values.member_id) });
      toast.success(`Book returned · fine ${formatCurrency(result.fine_amount)}`);
      navigate("/books");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading return options" />;
  if (loadError) return <div className="card p-6 text-sm text-rose-600">{loadError}</div>;

  return (
    <>
      <PageHeader eyebrow="Circulation" title="Return a book" description="Record the return of a book currently on loan." action={<Link className="btn-secondary" to="/books"><ArrowLeft size={15} /> Back to books</Link>} />
      <form className="card mx-auto max-w-2xl p-5 sm:p-8" onSubmit={handleSubmit(submit)}>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><ArrowDownToLine size={18} /></div>
          <div><h2 className="text-sm font-bold text-ink">Return details</h2><p className="mt-0.5 text-xs text-muted">Select the book and member from the active loan.</p></div>
        </div>
        <div className="space-y-5">
          <FormField
            as="select"
            label="Book *"
            error={errors.book_id?.message}
            options={[{ value: "", label: "Choose a book" }, ...books.filter((book) => book.available_quantity < book.quantity).map((book) => ({ value: book.id, label: `${book.title} · ${book.quantity - book.available_quantity} on loan` }))]}
            {...register("book_id", { required: "Choose the book being returned" })}
          />
          <FormField
            as="select"
            label="Member *"
            error={errors.member_id?.message}
            options={[{ value: "", label: "Choose a member" }, ...members.map((member) => ({ value: member.id, label: `${member.name} · ${member.member_id}` }))]}
            {...register("member_id", { required: "Choose the member returning the book" })}
          />
          {selectedBook && <div className="rounded-xl bg-amber-50 p-3.5 text-xs text-amber-800"><RotateCcw size={15} className="mr-2 inline" />{selectedBook.title} · {selectedBook.quantity - selectedBook.available_quantity} currently on loan</div>}
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link className="btn-secondary" to="/books">Cancel</Link>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Returning…" : <><ArrowDownToLine size={16} /> Record return</>}</button>
        </div>
      </form>
    </>
  );
}
