export default function ShareProfile() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Share Profile</h2>
      <p className="mt-2 text-sm text-slate-400">
        Generate a public profile link for recruiters and partners.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          readOnly
          value="https://skill-galaxy.example/profile/demo-user"
          className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300 outline-none"
        />
        <button
          type="button"
          className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Copy link
        </button>
      </div>
    </section>
  )
}