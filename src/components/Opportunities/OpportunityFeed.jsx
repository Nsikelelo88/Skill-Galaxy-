import OpportunityCard from './OpportunityCard'

const sampleOpportunities = [
  {
    id: 'opp-1',
    organization: 'Galaxy Labs',
    title: 'Frontend Intern',
    type: 'Remote',
    description: 'Build polished interfaces for talent discovery and proof-of-skill workflows.',
  },
  {
    id: 'opp-2',
    organization: 'Orbit Works',
    title: 'Community Fellow',
    type: 'Hybrid',
    description: 'Support onboarding, mentorship, and community programming for emerging creators.',
  },
]

export default function OpportunityFeed({ opportunities = sampleOpportunities }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-white">Opportunity Feed</h2>
      <p className="mt-2 text-sm text-slate-400">
        Surface jobs, fellowships, grants, and calls for collaboration.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </section>
  )
}