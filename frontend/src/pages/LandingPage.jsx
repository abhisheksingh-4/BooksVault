import { useState } from "react";
import {
  ArrowDownRight, ArrowRight, Archive, BookOpen, Check, ChevronDown, Github,
  LibraryBig, Menu, Repeat2, Search, ShieldCheck, UsersRound, X,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/booksvault-mark.svg";
import ThemeToggle from "../components/ThemeToggle";

const features = [
  { icon: BookOpen, title: "A considered catalogue", detail: "Keep titles, authors, editions, and availability together in one searchable record." },
  { icon: UsersRound, title: "People, not paperwork", detail: "Manage member details and borrowing history without losing the human context." },
  { icon: Repeat2, title: "Circulation in motion", detail: "Issue and return books with clear due dates and current availability." },
  { icon: Archive, title: "A place for every detail", detail: "Connect books to authors, categories, and publishers as your collection grows." },
  { icon: LibraryBig, title: "A useful overview", detail: "See recent issues, returns, popular titles, and overdue records in one place." },
  { icon: ShieldCheck, title: "The right access", detail: "Admin, librarian, and member roles keep each workspace focused." },
];

const workflow = [
  ["01", "Sign in", "Open the workspace for your library."],
  ["02", "Shape the catalogue", "Keep books, members, and details current."],
  ["03", "Lend with clarity", "Record each issue and its return date."],
  ["04", "Close the loop", "Return titles to circulation and review activity."],
];

const faqs = [
  ["What is BooksVault?", "BooksVault is a library management workspace for maintaining a catalogue, supporting members, and tracking circulation."],
  ["Which roles can use it?", "The workspace supports admin, librarian, and member roles, with access based on each person's role."],
  ["Can I find a title by more than its name?", "The catalogue supports search and filters for details such as ISBN, author, category, publisher, and availability."],
  ["How do I access my library?", "Sign in with the account provided by your library. BooksVault keeps the existing library sign-in flow."],
];

function Brand({ inverse = false }) {
  return (
    <Link to="/" aria-label="BooksVault home" className="inline-flex items-center gap-2.5">
      <img src={logo} className="h-10 w-10" alt="" />
      <span className={`font-display text-[21px] tracking-[-0.035em] ${inverse ? "text-white" : "text-ink"}`}>BooksVault</span>
    </Link>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [["The system", "#features"], ["Workflow", "#workflow"], ["Inside", "#preview"], ["Questions", "#faq"]];
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#ded8cb] bg-[#f3f0e7]/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12" aria-label="Main navigation">
        <Brand />
        <div className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => <a key={href} href={href} className="text-[13px] font-medium text-muted transition hover:text-forest">{label}</a>)}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="px-3 py-2 text-sm font-semibold text-ink transition hover:text-copper">Log in</Link>
          <Link to="/login" className="btn-primary !px-4 !py-2.5">Open BooksVault <ArrowRight size={15} /></Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="btn-icon md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="border-t border-[#ded8cb] bg-[#f3f0e7] px-5 py-4 md:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-1" aria-label="Mobile navigation">
            {links.map(([label, href]) => <a key={href} href={href} onClick={closeMenu} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-white/70">{label}</a>)}
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-[#ded8cb] pt-4">
              <Link to="/login" onClick={closeMenu} className="btn-secondary">Log in</Link>
              <Link to="/login" onClick={closeMenu} className="btn-primary">Open BooksVault <ArrowRight size={15} /></Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function ArchiveIllustration() {
  return (
    <svg viewBox="0 0 640 520" className="h-full w-full" role="img" aria-labelledby="archive-title archive-desc">
      <title id="archive-title">The BooksVault collection mark</title>
      <desc id="archive-desc">An arched archive alcove holding a row of books, with an open volume in front.</desc>
      <path d="M66 422V202C66 84 160 36 320 36s254 48 254 166v220" fill="#e7dfd0" />
      <path d="M103 422V204c0-95 76-130 217-130s217 35 217 130v218" fill="#f6f2e9" stroke="#d4c9b6" strokeWidth="2" />
      <path d="M129 223h382M129 304h382M129 385h382" stroke="#cfc4b1" strokeWidth="3" />
      <g>
        <path d="M148 174h44v49h-44z" fill="#345647" /><path d="M155 181h30v2h-30z" fill="#d9b88c" />
        <path d="M199 153h35v70h-35z" fill="#b77b50" /><path d="M207 162h19v2h-19z" fill="#f0dfc7" />
        <path d="M242 166h56v57h-56z" fill="#827b62" /><path d="M250 174h39v2h-39z" fill="#eee8d8" />
        <path d="M305 143h42v80h-42z" fill="#d8c5a6" /><path d="M313 153h26v2h-26z" fill="#615b4b" />
        <path d="M353 160h56v63h-56z" fill="#3f6252" /><path d="M362 169h38v2h-38z" fill="#dcc7a5" />
        <path d="M416 149h39v74h-39z" fill="#a65f44" /><path d="M424 158h23v2h-23z" fill="#f0dfc7" />
        <path d="M462 178h31v45h-31z" fill="#c6a674" />
      </g>
      <g>
        <path d="M155 272h38v33h-38z" fill="#b77b50" /><path d="M199 252h49v53h-49z" fill="#d6c3a3" />
        <path d="M254 262h36v43h-36z" fill="#3f6252" /><path d="M296 246h48v59h-48z" fill="#a65f44" />
        <path d="M351 270h39v35h-39z" fill="#817b66" /><path d="M397 254h53v51h-53z" fill="#395348" />
        <path d="M456 267h38v38h-38z" fill="#d3b88f" />
      </g>
      <g>
        <path d="M148 351h55v34h-55z" fill="#d3b88f" /><path d="M210 336h37v49h-37z" fill="#a65f44" />
        <path d="M254 344h52v41h-52z" fill="#3f6252" /><path d="M313 330h39v55h-39z" fill="#827b62" />
        <path d="M359 350h55v35h-55z" fill="#b77b50" /><path d="M421 338h34v47h-34z" fill="#d6c3a3" />
        <path d="M462 347h32v38h-32z" fill="#345647" />
      </g>
      <path d="M120 423h400" stroke="#a99b84" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="320" cy="451" rx="151" ry="17" fill="#d9cfbd" opacity=".58" />
      <path d="M218 394c34-20 68-22 102-8v73c-34-14-68-12-102 8v-73Z" fill="#fffdf8" stroke="#a96d43" strokeWidth="2" />
      <path d="M320 386c34-14 68-12 102 8v73c-34-20-68-22-102-8v-73Z" fill="#efe7d8" stroke="#a96d43" strokeWidth="2" />
      <path d="M320 386v73" stroke="#a96d43" strokeWidth="2" />
      <path d="M236 415c19-8 39-9 59-4M236 427c19-8 39-9 59-4M345 411c20-5 40-4 59 4M345 423c20-5 40-4 59 4" stroke="#cbbda6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="451" cy="110" r="13" fill="#a96d43" opacity=".88" />
      <path d="M451 97c-14-18-29-12-24-3 4 7 15 8 24 3Zm2 0c13-19 29-13 24-4-4 7-15 8-24 4Z" fill="#496d58" />
      <path d="M95 154h-23m0 0 8-8m-8 8 8 8M540 335h23m0 0-8-8m8 8-8 8" stroke="#a96d43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FeatureCard({ icon: Icon, title, detail, index }) {
  return (
    <article className="group border-t border-[#cfc7b8] py-6 transition-colors hover:border-copper">
      <div className="flex items-start justify-between gap-5">
        <span className="font-mono text-[11px] text-copper">0{index + 1}</span>
        <Icon size={20} strokeWidth={1.6} className="text-forest transition-transform group-hover:-translate-y-0.5" />
      </div>
      <h3 className="mt-7 font-display text-[22px] leading-tight text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{detail}</p>
    </article>
  );
}

function LandingPage() {
  return (
    <div className="overflow-hidden bg-[#f3f0e7] text-ink">
      <Navbar />
      <main>
        <section className="relative border-b border-[#ded8cb]">
          <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.94fr_1.06fr] lg:px-12 lg:py-16">
            <div className="vault-enter relative z-10 pb-8 lg:pb-0">
              <p className="vault-kicker mb-6">A library, in good order <span className="mx-2 text-[#c5b9a5]">/</span> 01—04</p>
              <h1 className="max-w-[680px] font-display text-[48px] leading-[1.03] tracking-[-0.045em] text-forest sm:text-6xl lg:text-[76px]">
                Every story has a place.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[#59635a] sm:text-lg sm:leading-8">
                BooksVault brings your catalogue, members, and circulation into one quietly capable workspace—so the work behind every good library stays in view.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/login" className="btn-primary !px-5 !py-3">Enter BooksVault <ArrowRight size={16} /></Link>
                <a href="#features" className="inline-flex items-center gap-2 rounded-[9px] px-4 py-3 text-sm font-semibold text-ink transition hover:bg-white/70">Explore the system <ArrowDownRight size={16} /></a>
              </div>
              <div className="mt-12 flex items-center gap-3 border-t border-[#d6cebf] pt-5">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-[#cfc5b3] text-forest"><Check size={16} /></span>
                <p className="text-xs leading-5 text-muted">One place for the catalogue, the people, and the lending history.</p>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[620px] lg:max-w-none">
              <div className="absolute inset-x-8 bottom-12 top-12 rounded-[48%] bg-[#e8dfd0]" />
              <div className="relative aspect-[1.15]"><ArchiveIllustration /></div>
              <div className="absolute bottom-1 left-0 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                <span className="h-px w-8 bg-copper" /> Keep the collection connected
              </div>
            </div>
          </div>
          <div className="mx-auto flex max-w-[1440px] items-center justify-between border-t border-[#ded8cb] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#858579] sm:px-8 lg:px-12">
            <span>BooksVault / Library operations</span><span className="hidden sm:inline">Catalogue · Circulation · Insight</span><span>Since the first card</span>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 bg-[#fffdf8]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid gap-8 border-b border-[#ded8cb] pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <p className="vault-kicker">01 / The system</p>
              <div className="max-w-3xl">
                <h2 className="font-display text-4xl leading-[1.08] tracking-[-0.03em] text-forest sm:text-5xl">The quiet work behind a well-run library.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">The moving parts belong together. BooksVault keeps the everyday record clear, from the first catalogue entry to the final return.</p>
              </div>
            </div>
            <div className="mt-8 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}
            </div>
          </div>
        </section>

        <section id="preview" className="scroll-mt-24 bg-[#e8e0d1]">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-12">
            <div className="max-w-lg">
              <p className="vault-kicker">02 / One continuous record</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-[-0.03em] text-forest sm:text-5xl">A title moves. Its history stays.</h2>
              <p className="mt-5 text-sm leading-7 text-[#59635a] sm:text-base">From a searchable catalogue to a completed return, each step belongs to the same library record. No extra dashboard theatre—just the details your team needs to keep the collection in motion.</p>
              <Link to="/login" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-forest transition hover:gap-3">See your workspace <ArrowRight size={16} /></Link>
            </div>
            <div className="relative overflow-hidden rounded-[18px] border border-[#d3c8b7] bg-[#f7f3e9] p-5 shadow-lift sm:p-8">
              <div className="flex items-center justify-between border-b border-[#ded5c7] pb-4">
                <div className="flex items-center gap-3"><img src={logo} className="h-8 w-8" alt="" /><span className="font-display text-lg text-forest">A book's journey</span></div>
                <span className="vault-kicker">BooksVault / Record</span>
              </div>
              <div className="grid gap-3 py-7 sm:grid-cols-4">
                {[
                  [BookOpen, "Catalogue", "A place in the collection"],
                  [Search, "Discovery", "Find by the details"],
                  [Repeat2, "Circulation", "Issue and return"],
                  [Archive, "History", "The record remains"],
                ].map(([Icon, title, description], index) => (
                  <div key={title} className="relative flex min-h-[142px] flex-col justify-between rounded-xl border border-[#ded5c7] bg-[#fffdf8] p-4">
                    <div className="flex items-center justify-between"><Icon size={18} className="text-copper" strokeWidth={1.7} /><span className="font-mono text-[10px] text-[#9b927f]">0{index + 1}</span></div>
                    <div><h3 className="font-display text-lg text-forest">{title}</h3><p className="mt-1 text-[11px] leading-4 text-muted">{description}</p></div>
                    {index < 3 && <ArrowRight className="absolute -right-[13px] top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-[#a96d43] p-1 text-white sm:block" size={22} />}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t border-[#ded5c7] pt-4 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-[#44785e]" />
                <span>One connected workflow, using the existing library records.</span>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-24 bg-[#203b32] text-[#f3f0e7]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.65fr_1.35fr] lg:px-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#d7b181]">03 / A steady rhythm</p>
              <h2 className="mt-4 max-w-sm font-display text-4xl leading-[1.08] tracking-[-0.025em] sm:text-5xl">From first entry to last return.</h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#c0c9bd]">A straightforward path through the work your library does every day.</p>
            </div>
            <ol className="grid gap-0 sm:grid-cols-2">
              {workflow.map(([number, title, detail]) => (
                <li key={number} className="border-t border-white/20 py-5 sm:px-5 sm:py-6">
                  <span className="font-mono text-[11px] text-[#d7b181]">{number} <span className="ml-1 text-white/35">/ 04</span></span>
                  <h3 className="mt-5 font-display text-2xl">{title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[#c0c9bd]">{detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-[#f3f0e7]">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="flex flex-col gap-6 border-b border-[#d6cebf] pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="vault-kicker">05 / The shape of the system</p>
                <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest sm:text-4xl">Small by design. Connected by default.</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted">A few practical measures describe the workspace—not claims about a library’s size or outcomes.</p>
            </div>
            <div className="grid gap-6 pt-7 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["06", "Connected capability areas"],
                ["03", "Access roles"],
                ["04", "Everyday workflow steps"],
                ["01", "Shared catalogue"],
              ].map(([value, label]) => (
                <div key={label} className="border-l-2 border-copper pl-4">
                  <p className="font-display text-4xl leading-none tracking-[-0.04em] text-forest">{value}</p>
                  <p className="mt-2 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f3f0e7]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-12">
            <div>
              <p className="vault-kicker">04 / Shared by the team</p>
              <h2 className="mt-4 max-w-sm font-display text-4xl leading-[1.08] tracking-[-0.03em] text-forest sm:text-5xl">One collection. Three perspectives.</h2>
              <p className="mt-5 max-w-sm text-sm leading-7 text-muted">BooksVault is shaped around the people who care for a collection and the people who borrow from it.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Administrator", "Steward access, people, and the catalogue."],
                ["02", "Librarian", "Keep lending, returns, and records moving."],
                ["03", "Member", "See the collection and your borrowing activity."],
              ].map(([number, role, detail]) => (
                <article key={role} className="flex min-h-[190px] flex-col justify-between border-t border-[#cfc7b8] py-5">
                  <span className="font-mono text-[11px] text-copper">{number}</span>
                  <div><h3 className="font-display text-2xl text-forest">{role}</h3><p className="mt-2 text-sm leading-6 text-muted">{detail}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-[#fffdf8]">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:px-12">
            <div>
              <p className="vault-kicker">05 / Useful to know</p>
              <h2 className="mt-4 max-w-sm font-display text-4xl leading-[1.08] tracking-[-0.03em] text-forest sm:text-5xl">A few answers before you begin.</h2>
            </div>
            <div className="divide-y divide-[#ded8cb] border-y border-[#ded8cb]">
              {faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden">
                    {question}<ChevronDown size={18} className="shrink-0 text-copper transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="max-w-2xl pt-3 text-sm leading-6 text-muted">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 bg-[#a96d43]">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-14 sm:px-8 sm:py-16 md:flex-row md:items-end md:justify-between lg:px-12">
            <div className="max-w-2xl text-[#fffdf8]">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f1dfca]">06 / Begin with your library</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl">Make room for the stories still to come.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#f4e7d8]">Sign in with the account your library already uses to open the BooksVault workspace.</p>
            </div>
            <Link to="/login" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[9px] bg-[#fffdf8] px-5 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:shadow-lift">
              Enter BooksVault <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer id="about" className="bg-[#203b32] text-[#f3f0e7]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <Brand inverse />
            <p className="mt-3 max-w-sm text-xs leading-5 text-[#c0c9bd]">A considered home for the catalogue, the people, and every book in motion.</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#d1d5ca]" aria-label="Footer navigation">
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
            <a href="https://github.com/abhisheksingh-4/BooksVault" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-white"><Github size={14} /> GitHub</a>
          </nav>
        </div>
        <div className="border-t border-white/15 py-4 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#9eaa9e]">© {new Date().getFullYear()} BooksVault · A library in good order</div>
      </footer>
    </div>
  );
}

export default LandingPage;
