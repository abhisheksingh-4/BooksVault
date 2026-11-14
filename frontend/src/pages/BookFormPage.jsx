import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, BookPlus, Save } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { bookService } from "../services/bookService";
import { errorMessage } from "../utils/format";

const blankBook = { isbn: "", title: "", author_name: "", publisher_name: "", category_name: "", edition: "", language: "", quantity: 1, rack_number: "" };

export default function BookFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: blankBook });

  useEffect(() => {
    if (!editing) return;
    bookService.get(id).then((book) => reset({
      isbn: book.isbn,
      title: book.title,
      author_name: book.author || "",
      publisher_name: book.publisher || "",
      category_name: book.category || "",
      edition: book.edition || "",
      language: book.language || "",
      quantity: book.quantity,
      rack_number: book.rack_number || "",
    })).catch((error) => setLoadError(errorMessage(error))).finally(() => setLoading(false));
  }, [editing, id, reset]);

  const submit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        quantity: Number(values.quantity),
        edition: values.edition || null,
        language: values.language || null,
        rack_number: values.rack_number || null,
      };
      if (editing) await bookService.update(id, payload);
      else await bookService.create(payload);
      toast.success(editing ? "Book details updated" : "Book added to the catalog");
      navigate("/books");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading book" />;
  if (loadError) return <div className="card p-6 text-sm text-rose-600">{loadError} <Link className="ml-2 underline" to="/books">Back to books</Link></div>;

  return (
    <>
      <PageHeader eyebrow="Catalog" title={editing ? "Edit book" : "Add a book"} description={editing ? "Update catalog details and inventory." : "Add a title to your library catalog."} action={<Link className="btn-secondary" to="/books"><ArrowLeft size={15} /> Back to books</Link>} />
      <form className="card mx-auto max-w-4xl p-5 sm:p-8" onSubmit={handleSubmit(submit)}>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600"><BookPlus size={18} /></div>
          <div><h2 className="text-sm font-bold text-ink">Book information</h2><p className="mt-0.5 text-xs text-muted">Fields marked with * are required.</p></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Title *" placeholder="The book title" error={errors.title?.message} {...register("title", { required: "Title is required", maxLength: { value: 255, message: "Maximum 255 characters" } })} />
          <FormField label="ISBN *" placeholder="978-…" error={errors.isbn?.message} {...register("isbn", { required: "ISBN is required", maxLength: { value: 255, message: "Maximum 255 characters" } })} />
          <FormField label="Author *" placeholder="Author name" error={errors.author_name?.message} {...register("author_name", { required: "Author is required" })} />
          <FormField label="Publisher *" placeholder="Publisher name" error={errors.publisher_name?.message} {...register("publisher_name", { required: "Publisher is required" })} />
          <FormField label="Category *" placeholder="Category name" error={errors.category_name?.message} {...register("category_name", { required: "Category is required" })} />
          <FormField label="Edition" placeholder="e.g. 2nd edition" {...register("edition")} />
          <FormField label="Language" placeholder="e.g. English" {...register("language")} />
          <FormField label="Rack number" placeholder="e.g. A-12" {...register("rack_number")} />
          <FormField label="Total quantity *" type="number" min="0" error={errors.quantity?.message} {...register("quantity", { required: "Quantity is required", min: { value: 0, message: "Quantity cannot be negative" }, valueAsNumber: true })} />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link className="btn-secondary" to="/books">Cancel</Link>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : <><Save size={16} /> {editing ? "Save changes" : "Add book"}</>}</button>
        </div>
      </form>
    </>
  );
}
