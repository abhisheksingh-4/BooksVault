import { ArrowLeft, BookX } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { isAuthenticated, user } = useAuth();
  const home = isAuthenticated ? (user?.role === "member" ? "/books" : "/dashboard") : "/";
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-brand-50 text-brand-600"><BookX size={34} /></div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">404 · Page not found</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink">This page is off the shelf.</h1>
        <p className="mt-3 text-sm leading-6 text-muted">The page you’re looking for may have moved or may not exist.</p>
        <Link className="btn-primary mt-7" to={home}><ArrowLeft size={16} /> {isAuthenticated ? "Back to your workspace" : "Back to sign in"}</Link>
      </div>
    </div>
  );
}
