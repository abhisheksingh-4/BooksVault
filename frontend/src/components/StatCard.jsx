export default function StatCard({ label, value, note, icon: Icon, tone = "blue" }) {
  const tones = {
    blue: "bg-[#e6ece5] text-forest",
    violet: "bg-[#eee8dc] text-[#7d694f]",
    amber: "bg-[#f1e5d7] text-copper",
    emerald: "bg-[#e4ece4] text-success",
    rose: "bg-[#f2e5df] text-error",
    cyan: "bg-[#e8ebe3] text-[#687c65]",
  };
  return (
    <article className="vault-panel group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
      <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-transparent transition group-hover:bg-copper" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="mt-4 font-display text-[32px] leading-none tracking-[-0.035em] text-forest">{value ?? "—"}</p>
          {note && <p className="mt-2 text-[11px] text-muted">{note}</p>}
        </div>
        <div className={`rounded-[10px] p-2.5 ${tones[tone] || tones.blue}`}><Icon size={18} strokeWidth={1.8} /></div>
      </div>
    </article>
  );
}
