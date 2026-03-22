const defaultSkills = ['Frontend Development', 'UI Design', 'Firebase', 'Product Thinking']

export default function SkillList({ skills = defaultSkills }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Skill List</h2>
          <p className="mt-2 text-sm text-slate-400">
            Surface key abilities to employers and mentors.
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl border border-cyan-400/40 px-4 py-2 text-sm font-medium text-cyan-200"
        >
          Add skill
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  )
}