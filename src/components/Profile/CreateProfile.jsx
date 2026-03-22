export default function CreateProfile() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Create Profile</h2>
      <p className="mt-2 text-sm text-slate-400">
        Collect personal details, bio, and headline here.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Professional headline"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <input
          type="text"
          placeholder="Location"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <textarea
          placeholder="Short bio"
          rows="4"
          className="md:col-span-2 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
      </div>
    </section>
  )
}