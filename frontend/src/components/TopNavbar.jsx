import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function TopNavbar({ onMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const initials = (user?.full_name || user?.email || "U").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const currentPage = pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", " ") || "overview";
  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#ded8cb] bg-[#f3f0e7]/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
      <div className="flex items-center gap-3">
        <button className="btn-icon lg:hidden" aria-label="Open navigation" onClick={onMenu}><Menu size={20} /></button>
        <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[#83877c] sm:flex">
          <span className="text-copper">BooksVault</span>
          <span>/</span>
          <span className="capitalize">{currentPage}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <Link to="/profile" className="flex items-center gap-2.5 rounded-[9px] py-1 pl-2 transition hover:bg-white/60" aria-label="Open profile">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-ink">{user?.full_name || "Library user"}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted">{user?.role || "member"}</p>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-forest font-mono text-[11px] text-[#f3f0e7]">{initials}</div>
        </Link>
      </div>
    </header>
  );
}
