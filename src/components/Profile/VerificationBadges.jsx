import { getTrustScoreSummary } from '../../services/trustScore';

const getCount = (value, fallback = 0) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  return value || fallback;
};

function Badge({ label, tooltip, icon, tone }) {
  const toneClass = {
    verified: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    endorsed: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    reviewed: 'border-sky-400/30 bg-sky-400/10 text-sky-200',
    trust: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
  }[tone];

  return (
    <div className="group relative inline-flex">
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium ${toneClass}`}>
        <span aria-hidden="true">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-56 -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-xl transition group-hover:opacity-100">
        {tooltip}
      </div>
    </div>
  );
}

export default function VerificationBadges({ profile = {}, emailVerified }) {
  const endorsementCount = getCount(profile.endorsements, profile.endorsementCount || 0);
  const reviewCount = getCount(profile.reviews, profile.reviewCount || 0);
  const phoneVerified = Boolean(profile.phoneVerified);
  const resolvedEmailVerified = Boolean(emailVerified ?? profile.emailVerified);
  const { badge, totalScore } = getTrustScoreSummary(profile);

  return (
    <div className="flex flex-wrap gap-3">
      {phoneVerified ? (
        <Badge
          tone="verified"
          icon="✓"
          label="Phone Verified"
          tooltip="This worker has a verified phone status flag on their profile."
        />
      ) : null}

      {resolvedEmailVerified ? (
        <Badge
          tone="verified"
          icon="✓"
          label="Email Verified"
          tooltip="This badge comes from Firebase Authentication email verification status."
        />
      ) : null}

      {endorsementCount > 0 ? (
        <Badge
          tone="endorsed"
          icon="★"
          label={`Endorsed by ${endorsementCount} peer${endorsementCount === 1 ? '' : 's'}`}
          tooltip="Peer endorsements show how many users have vouched for this person's listed skills."
        />
      ) : null}

      {reviewCount > 0 ? (
        <Badge
          tone="reviewed"
          icon="💬"
          label={`${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
          tooltip="Client reviews reflect written feedback and star ratings left by other users."
        />
      ) : null}

      <Badge
        tone="trust"
        icon={badge.icon}
        label={`${badge.label} Trust`}
        tooltip={`Trust score ${totalScore}. This level is calculated from profile completion, listed skills, endorsements, and reviews.`}
      />
    </div>
  );
}