export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-[#ded8cb] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="vault-kicker mb-2">{eyebrow}</p>}
        <h1 className="font-display text-[32px] leading-tight tracking-[-0.035em] text-forest sm:text-[38px]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
