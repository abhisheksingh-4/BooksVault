import {
  Activity, ArrowDownToLine, ArrowUpFromLine, BookOpen, ChartNoAxesCombined, ChevronRight,
  CircleDollarSign, LayoutDashboard, LibraryBig, LogOut, Tags, Users, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import logo from "../assets/booksvault-mark.svg";
import { useAuth } from "../context/AuthContext";

const primaryLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["admin", "librarian"] },
  { to: "/books", label: "Books", icon: BookOpen },
  { to: "/members", label: "Members", icon: Users, roles: ["admin", "librarian"] },
];

const circulationLinks = [
  { to: "/issue", label: "Issue a book", icon: ArrowUpFromLine, roles: ["admin", "librarian"] },
  { to: "/return", label: "Return a book", icon: ArrowDownToLine, roles: ["admin", "librarian"] },
];

const libraryLinks = [
  { to: "/authors", label: "Authors", icon: Users, roles: ["admin", "librarian"] },
  { to: "/categories", label: "Categories", icon: Tags, roles: ["admin", "librarian"] },
  { to: "/publishers", label: "Publishers", icon: LibraryBig, roles: ["admin", "librarian"] },
];

const insightLinks = [
  { to: "/fines", label: "Fines", icon: CircleDollarSign, roles: ["admin", "librarian"] },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined, roles: ["admin", "librarian"] },
  { to: "/activity", label: "Activity log", icon: Activity, roles: ["admin", "librarian"] },
];

function LinkGroup({ title, links, user, onNavigate }) {
  const visible = links.filter(({ roles }) => !roles || roles.includes(user?.role));
  if (!visible.length) return null;
  return (
    <div className="mb-7">
      <p className="mb-2 px-3 font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a8b7e]">{title}</p>
      <div className="space-y-0.5">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `group flex items-center gap-3 rounded-[9px] border-l-2 px-3 py-2.5 text-[13px] font-medium transition ${
              isActive ? "border-copper bg-[#fffdf8] text-forest shadow-sm" : "border-transparent text-[#5e675f] hover:bg-white/60 hover:text-forest"
            }`}
          >
            <Icon size={16} strokeWidth={1.8} />
            <span className="flex-1">{label}</span>
            <ChevronRight className="opacity-0 transition group-hover:opacity-40" size={13} />
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  return (
    <>
      {open && <button className="fixed inset-0 z-40 bg-[#172e27]/40 backdrop-blur-[2px] lg:hidden" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#dcd5c8] bg-[#ebe6dc] px-4 text-ink transition-transform duration-300 lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-[76px] items-center justify-between border-b border-[#d8d0c2] px-2">
          <div className="flex items-center gap-3">
            <img className="h-10 w-10" src={logo} alt="" />
            <div>
              <p className="font-display text-[18px] tracking-[-0.035em]">BooksVault</p>
              <p className="font-mono text-[9px] tracking-[0.12em] text-[#7b8077]">LIBRARY WORKSPACE</p>
            </div>
          </div>
          <button className="btn-icon lg:hidden" aria-label="Close sidebar" onClick={onClose}><X size={18} /></button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto pr-1">
          <LinkGroup title="Workspace" links={primaryLinks} user={user} onNavigate={onClose} />
          <LinkGroup title="Circulation" links={circulationLinks} user={user} onNavigate={onClose} />
          <LinkGroup title="Catalog" links={libraryLinks} user={user} onNavigate={onClose} />
          <LinkGroup title="Insights" links={insightLinks} user={user} onNavigate={onClose} />
        </nav>

        <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `mb-3 flex items-center gap-3 rounded-[10px] border border-[#d8d0c2] bg-white/45 p-3 transition hover:bg-white/80 ${isActive ? "border-copper/50 bg-[#fffdf8]" : ""}`}>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-forest text-xs font-semibold uppercase text-[#f3f0e7]">
            {(user?.full_name || user?.email || "U").slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user?.full_name || "Library user"}</p>
            <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.09em] text-[#777d73]">{user?.role || "member"} account</p>
          </div>
        </NavLink>
        <button onClick={logout} className="mb-4 flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-xs font-semibold text-[#6d756c] transition hover:bg-[#f4e4dc] hover:text-error">
          <LogOut size={15} /> Sign out
        </button>
      </aside>
    </>
  );
}
