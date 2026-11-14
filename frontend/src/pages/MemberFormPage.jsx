import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import LoadingSpinner from "../components/LoadingSpinner";
import PageHeader from "../components/PageHeader";
import { memberService } from "../services/memberService";
import { errorMessage } from "../utils/format";

const blankMember = { member_id: "", name: "", email: "", phone: "", address: "" };

export default function MemberFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: blankMember });

  useEffect(() => {
    if (!editing) return;
    memberService.get(id).then((member) => reset({
      member_id: member.member_id,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      address: member.address || "",
    })).catch((error) => setLoadError(errorMessage(error))).finally(() => setLoading(false));
  }, [editing, id, reset]);

  const submit = async (values) => {
    setSaving(true);
    try {
      if (editing) await memberService.update(id, values);
      else await memberService.create(values);
      toast.success(editing ? "Member details updated" : "Member added");
      navigate("/members");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading member" />;
  if (loadError) return <div className="card p-6 text-sm text-rose-600">{loadError} <Link className="ml-2 underline" to="/members">Back to members</Link></div>;

  return (
    <>
      <PageHeader eyebrow="People" title={editing ? "Edit member" : "Add a member"} description="Keep member contact details current." action={<Link className="btn-secondary" to="/members"><ArrowLeft size={15} /> Back to members</Link>} />
      <form className="card mx-auto max-w-3xl p-5 sm:p-8" onSubmit={handleSubmit(submit)}>
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><UserPlus size={18} /></div>
          <div><h2 className="text-sm font-bold text-ink">Member information</h2><p className="mt-0.5 text-xs text-muted">A unique member ID and email are required.</p></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Member ID *" placeholder="e.g. MEM-105" error={errors.member_id?.message} {...register("member_id", { required: "Member ID is required", maxLength: 100 })} />
          <FormField label="Full name *" placeholder="Member name" error={errors.name?.message} {...register("name", { required: "Name is required", maxLength: 255 })} />
          <FormField label="Email *" type="email" placeholder="member@example.com" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" }, maxLength: 255 })} />
          <FormField label="Phone" type="tel" placeholder="Phone number" {...register("phone")} />
          <FormField label="Address" placeholder="Street address" className="sm:col-span-2" {...register("address")} />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5">
          <Link className="btn-secondary" to="/members">Cancel</Link>
          <button className="btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : <><Save size={16} /> {editing ? "Save changes" : "Add member"}</>}</button>
        </div>
      </form>
    </>
  );
}
