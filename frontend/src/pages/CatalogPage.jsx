import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import ConfirmDialog from "../components/ConfirmDialog";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { catalogService } from "../services/catalogService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { errorMessage, titleCase } from "../utils/format";

export default function CatalogPage({ resource }) {
  const label = titleCase({ authors: "author", categories: "category", publishers: "publisher" }[resource]);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const search = useDebouncedValue(query);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: "", bio: "", address: "" } });
  const hasBio = resource === "authors";
  const hasAddress = resource === "publishers";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setItems(await catalogService.list(resource));
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { load(); }, [load]);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => !term || [item.name, item.bio, item.address].some((value) => String(value || "").toLowerCase().includes(term)));
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", bio: "", address: "" });
    setModalOpen(true);
  };
  const openEdit = (item) => {
    setEditing(item);
    reset({ name: item.name, bio: item.bio || "", address: item.address || "" });
    setModalOpen(true);
  };

  const submit = async (values) => {
    setSaving(true);
    try {
      const payload = { name: values.name.trim() };
      if (hasBio) payload.bio = values.bio || null;
      if (hasAddress) payload.address = values.address || null;
      if (editing) await catalogService.update(resource, editing.id, payload);
      else await catalogService.create(resource, payload);
      toast.success(`${label} ${editing ? "updated" : "created"}`);
      setModalOpen(false);
      await load();
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await catalogService.remove(resource, pendingDelete.id);
      toast.success(`${label} deleted`);
      setPendingDelete(null);
      await load();
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  const rows = visible.map((item) => ({
    ...item,
    actions: <div className="flex items-center justify-end gap-1">
      <button className="btn-icon" title={`Edit ${label.toLowerCase()}`} onClick={() => openEdit(item)}><Pencil size={15} /></button>
      <button className="btn-icon text-rose-500" title={`Delete ${label.toLowerCase()}`} onClick={() => setPendingDelete(item)}><Trash2 size={15} /></button>
    </div>,
  }));
  const columns = [
    { key: "name", label: label, render: (item) => <div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600"><Tags size={16} /></div><span className="font-semibold text-ink">{item.name}</span></div> },
    ...(hasBio ? [{ key: "bio", label: "Biography", render: (item) => <span className="line-clamp-2 max-w-lg">{item.bio || "—"}</span> }] : []),
    ...(hasAddress ? [{ key: "address", label: "Address", render: (item) => item.address || "—" }] : []),
    { key: "actions", label: "Actions", align: "right" },
  ];

  return (
    <>
      <PageHeader eyebrow="Catalog" title={titleCase(resource)} description={`Organize and maintain your ${resource} list.`} action={<button className="btn-primary" onClick={openCreate}><Plus size={16} /> Add {label.toLowerCase()}</button>} />
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="field pl-10" placeholder={`Search ${resource}…`} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <span className="text-xs text-muted">{visible.length} {visible.length === 1 ? label.toLowerCase() : resource}</span>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle={`No ${resource} found`}
          emptyDescription={query ? "Try a different search." : `Add a ${label.toLowerCase()} to begin organizing your catalog.`}
        />
      </section>

      <Modal open={modalOpen} title={`${editing ? "Edit" : "Add"} ${label.toLowerCase()}`} onClose={() => setModalOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <FormField label={`${label} name *`} placeholder={`${label} name`} error={errors.name?.message} {...register("name", { required: `${label} name is required`, maxLength: 255 })} />
          {hasBio && <FormField as="textarea" rows={4} label="Biography" placeholder="A short author biography" className="resize-y" {...register("bio")} />}
          {hasAddress && <FormField as="textarea" rows={3} label="Address" placeholder="Publisher address" className="resize-y" {...register("address")} />}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : editing ? "Save changes" : `Add ${label.toLowerCase()}`}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${label.toLowerCase()}?`}
        description={`“${pendingDelete?.name || ""}” will be deleted. Catalog entries referenced by books cannot be removed.`}
        confirmLabel={`Delete ${label.toLowerCase()}`}
        busy={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
