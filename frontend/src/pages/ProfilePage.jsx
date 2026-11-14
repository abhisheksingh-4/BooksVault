import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, Fingerprint, Mail, Shield, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import DataTable from "../components/DataTable";
import FormField from "../components/FormField";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { errorMessage, titleCase } from "../utils/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [userModal, setUserModal] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { full_name: "", email: "", password: "", role: "member" } });

  const loadTeam = useCallback(async () => {
    setTeamLoading(true);
    setTeamError("");
    try {
      const [userList, roleList] = await Promise.all([authService.listUsers(), authService.listRoles()]);
      setUsers(userList);
      setRoles(roleList);
    } catch (requestError) {
      setTeamError(errorMessage(requestError));
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") loadTeam();
  }, [user?.role, loadTeam]);

  const createUser = async (values) => {
    setSavingUser(true);
    try {
      await authService.createUser(values);
      toast.success("Account created");
      reset({ full_name: "", email: "", password: "", role: "member" });
      setUserModal(false);
      await loadTeam();
    } catch (requestError) {
      toast.error(errorMessage(requestError));
    } finally {
      setSavingUser(false);
    }
  };

  const changeRole = async (target, role) => {
    try {
      const changed = await authService.updateUserRole(target.id, role);
      setUsers((current) => current.map((item) => item.id === changed.id ? changed : item));
      toast.success(`${changed.full_name}'s role updated`);
    } catch (requestError) {
      toast.error(errorMessage(requestError));
      await loadTeam();
    }
  };

  const items = [
    { label: "Full name", value: user?.full_name || "—", icon: UserRound },
    { label: "Email address", value: user?.email || "—", icon: Mail },
    { label: "Account role", value: titleCase(user?.role || "member"), icon: Shield },
    { label: "Account ID", value: user?.id ? `#${user.id}` : "—", icon: Fingerprint },
  ];
  return (
    <>
      <PageHeader eyebrow="Account" title="My profile" description="Your BooksVault account details and access level." />
      <section className="vault-panel mx-auto max-w-3xl overflow-hidden">
        <div className="relative overflow-hidden bg-forest px-6 py-8 text-[#f3f0e7] sm:px-8">
          <div className="absolute -right-10 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-[14px] border border-white/20 bg-white/10 font-display text-2xl">{(user?.full_name || user?.email || "U").slice(0, 1).toUpperCase()}</div>
            <div><h2 className="font-display text-xl">{user?.full_name || "Library user"}</h2><p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#c0c9bd]">{user?.role || "member"} account</p></div>
            <div className="ml-auto hidden rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium sm:flex sm:items-center sm:gap-1.5"><BadgeCheck size={14} /> Signed in</div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-[10px] border border-[#ded8cb] p-4">
              <div className="rounded-[9px] bg-[#eee8dc] p-2.5 text-[#7d694f]"><Icon size={17} /></div>
              <div><p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p><p className="mt-1 text-sm font-semibold text-ink">{value}</p></div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-[#ded8cb] px-5 py-4 text-xs text-muted sm:px-8"><CalendarDays size={14} /> Session details are kept only for this browser session.</div>
      </section>
      {user?.role === "admin" && (
        <section className="vault-panel mt-6 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[#ded8cb] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div><h2 className="font-display text-xl text-forest">Team access</h2><p className="mt-1 text-xs text-muted">Create accounts and assign library roles.</p></div>
            <button className="btn-primary" onClick={() => { reset({ full_name: "", email: "", password: "", role: "member" }); setUserModal(true); }}>Add team member</button>
          </div>
          <DataTable
            columns={[
              { key: "full_name", label: "User", render: (item) => <div><p className="font-semibold text-ink">{item.full_name}</p><p className="text-xs text-slate-400">{item.email}</p></div> },
              { key: "role", label: "Role", render: (item) => <select className="field max-w-40 !py-2 capitalize" value={item.role} onChange={(event) => changeRole(item, event.target.value)} aria-label={`Role for ${item.full_name}`}>{roles.map((role) => <option key={role.name} value={role.name}>{titleCase(role.name)}</option>)}</select> },
            ]}
            rows={users}
            loading={teamLoading}
            error={teamError}
            onRetry={loadTeam}
            emptyTitle="No user accounts"
            emptyDescription="Add a librarian or member account to get started."
          />
        </section>
      )}
      <Modal open={userModal} title="Create an account" onClose={() => setUserModal(false)}>
        <form className="space-y-4" onSubmit={handleSubmit(createUser)}>
          <FormField label="Full name *" placeholder="Name" error={errors.full_name?.message} {...register("full_name", { required: "Full name is required", maxLength: 255 })} />
          <FormField label="Email *" type="email" placeholder="name@library.org" error={errors.email?.message} {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address" }, maxLength: 255 })} />
          <FormField label="Temporary password *" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register("password", { required: "Password is required", minLength: { value: 8, message: "Use at least 8 characters" }, maxLength: 128 })} />
          <FormField as="select" label="Role *" options={roles.map((role) => ({ value: role.name, label: titleCase(role.name) }))} {...register("role", { required: true })} />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setUserModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={savingUser}>{savingUser ? "Creating…" : "Create account"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
