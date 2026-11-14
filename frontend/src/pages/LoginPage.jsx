import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../utils/format";
import logo from "../assets/booksvault-mark.svg";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: "", password: "" } });

  if (isAuthenticated) return <Navigate to={user?.role === "member" ? "/books" : "/dashboard"} replace />;

  const submit = async (values) => {
    setBusy(true);
    try {
      const signedInUser = await login(values);
      toast.success(`Welcome back${signedInUser.full_name ? `, ${signedInUser.full_name.split(" ")[0]}` : ""}`);
      navigate(location.state?.from?.pathname || (signedInUser.role === "member" ? "/books" : "/dashboard"), { replace: true });
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f0e7] lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-forest px-10 py-9 text-[#f3f0e7] lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-32 -top-32 h-[540px] w-[540px] rounded-full border border-white/[0.08]" />
        <div className="absolute -right-16 -top-16 h-[410px] w-[410px] rounded-full border border-white/[0.07]" />
        <div className="absolute bottom-0 right-0 h-1/2 w-1/2 bg-gradient-to-tl from-[#a96d43]/15 to-transparent" />
        <Link to="/" className="relative z-10 inline-flex items-center gap-3">
          <img className="h-11 w-11" src={logo} alt="" />
          <span className="font-display text-[22px] tracking-[-0.035em]">BooksVault</span>
        </Link>
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.17em] text-[#d7b181]">A library, in good order</p>
          <h1 className="font-display text-5xl leading-[1.04] tracking-[-0.035em] xl:text-[64px]">A considered home for every story.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#c0c9bd]">Sign in to keep the catalogue, members, and everyday circulation connected.</p>
          <div className="mt-10 grid max-w-lg grid-cols-3 border-y border-white/15 py-4">
            {["Catalogue", "Circulation", "Records"].map((item, index) => (
              <div key={item} className={`${index ? "border-l border-white/15 pl-4" : ""} ${index < 2 ? "pr-3" : ""}`}>
                <span className="font-mono text-[9px] text-[#d7b181]">0{index + 1}</span>
                <p className="mt-1 text-xs text-[#e2e4d9]">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-xs text-[#c0c9bd]"><ShieldCheck size={15} className="text-[#d7b181]" /> Sign in with the account provided by your library.</div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="absolute right-5 top-5 z-10">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-[410px]">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img className="h-10 w-10" src={logo} alt="" />
              <span className="font-display text-xl tracking-[-0.035em] text-forest">BooksVault</span>
            </Link>
            <Link to="/" className="text-xs font-semibold text-muted transition hover:text-forest">Home</Link>
          </div>
          <p className="vault-kicker mb-2">Your library workspace</p>
          <h2 className="font-display text-[34px] leading-tight tracking-[-0.035em] text-forest">Welcome back.</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Use your library account to continue.</p>

          <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5" aria-label="Sign in to BooksVault">
            <FormField
              label="Email address"
              type="email"
              placeholder="you@library.org"
              autoComplete="username"
              required
              error={errors.email?.message}
              {...register("email", { required: "Email address is required", maxLength: { value: 255, message: "Email must be 255 characters or fewer" } })}
            />
            <div className="relative">
              <FormField
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                error={errors.password?.message}
                {...register("password", { required: "Password is required", maxLength: { value: 128, message: "Password must be 128 characters or fewer" } })}
              />
              <button type="button" className="absolute right-2 top-[31px] rounded-lg p-2 text-muted transition hover:bg-paper/60 hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <button type="submit" className="btn-primary mt-2 w-full !py-3" disabled={busy}>
              {busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Signing in…</> : <>Sign in <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 border-t border-[#ded8cb] pt-5">
            <KeyRound size={16} className="mt-0.5 shrink-0 text-copper" />
            <p className="text-xs leading-5 text-muted">Your session stays in this browser and is cleared when you sign out.</p>
          </div>
          <p className="mt-10 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#898b80]">BooksVault · Library management</p>
        </div>
      </section>
    </main>
  );
}
