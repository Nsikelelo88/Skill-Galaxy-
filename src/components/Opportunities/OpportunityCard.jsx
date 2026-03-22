export default function OpportunityCard({ opportunity }) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-cyan-400/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-200">{opportunity.organization}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{opportunity.title}</h3>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
          {opportunity.type}
        </span>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">{opportunity.description}</p>
    </article>
  )
}