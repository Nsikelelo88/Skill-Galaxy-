export default function Register() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
      <h2 className="text-2xl font-semibold text-white">Register</h2>
      <p className="mt-2 text-sm text-slate-400">
        Placeholder registration form for onboarding new talent.
      </p>
      <form className="mt-6 grid gap-4">
        <input
          type="text"
          placeholder="Full name"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <input
          type="email"
          placeholder="Email"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <input
          type="password"
          placeholder="Create password"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <button
          type="button"
          className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Create account
        </button>
      </form>
    </section>
  )
}