import { getTrustScoreSummary } from '../../services/trustScore';

export default function TrustScore({ profile }) {
  const { totalScore, percentage, badge, breakdown } = getTrustScoreSummary(profile);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Trust Score</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl text-white">{totalScore}</span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${badge.color}`}>
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Calculated from profile completion, skills, endorsements, and reviews.
          </p>
        </div>
        <div className="text-sm text-slate-400 sm:text-right">
          <p>{percentage}% to trusted visibility</p>
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full transition-all ${badge.progress}`} style={{ width: `${percentage}%` }} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Profile Completion</p>
          <p className="mt-2 text-sm text-slate-200">{breakdown.profileCompletionScore} / 20</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Skills Listed</p>
          <p className="mt-2 text-sm text-slate-200">{breakdown.skillsScore} / 25</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Peer Endorsements</p>
          <p className="mt-2 text-sm text-slate-200">{breakdown.peerEndorsementScore} / 30</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Client Reviews</p>
          <p className="mt-2 text-sm text-slate-200">{breakdown.clientReviewScore} / 25</p>
          <p className="mt-1 text-xs text-slate-500">5 points per review, capped at 25</p>
        </div>
      </div>
    </section>
  );
}