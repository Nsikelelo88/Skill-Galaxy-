export default function Login() {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-slate-950/30">
      <h2 className="text-2xl font-semibold text-white">Login</h2>
      <p className="mt-2 text-sm text-slate-400">
        Placeholder login form for email/password or social auth.
      </p>
      <form className="mt-6 grid gap-4">
        <input
          type="email"
          placeholder="Email"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <input
          type="password"
          placeholder="Password"
          className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        />
        <button
          type="button"
          className="rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Sign in
        </button>
      </form>
    </section>
  )
}