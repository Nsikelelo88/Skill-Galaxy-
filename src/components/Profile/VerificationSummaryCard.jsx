import { useMemo, useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getTrustScoreSummary } from '../../services/trustScore';

const profileCompletionChecks = [
  { key: 'name', label: 'Add your full name', isComplete: (profile) => Boolean(profile.name) },
  { key: 'location', label: 'Add your location', isComplete: (profile) => Boolean(profile.location) },
  {
    key: 'skills',
    label: 'List at least one skill',
    isComplete: (profile) => Array.isArray(profile.skills) && profile.skills.length > 0,
  },
  {
    key: 'photo',
    label: 'Upload a profile photo',
    isComplete: (profile) => Boolean(profile.photoURL || profile.profilePhoto || profile.avatarUrl),
  },
];

const trustLevels = [
  { label: 'Starter', minimum: 0, nextLabel: 'Emerging', nextThreshold: 31 },
  { label: 'Emerging', minimum: 31, nextLabel: 'Verified', nextThreshold: 71 },
  { label: 'Verified', minimum: 71, nextLabel: 'Trusted', nextThreshold: 101 },
  { label: 'Trusted', minimum: 101, nextLabel: null, nextThreshold: null },
];

const getProfileCompletion = (profile = {}) => {
  const completed = profileCompletionChecks.filter((check) => check.isComplete(profile));
  const missing = profileCompletionChecks.filter((check) => !check.isComplete(profile));

  return {
    percentage: Math.round((completed.length / profileCompletionChecks.length) * 100),
    missing,
  };
};

const getTrustProgress = (totalScore, level) => {
  const currentLevel = trustLevels.find((entry) => entry.label === level) || trustLevels[0];

  if (!currentLevel.nextThreshold) {
    return {
      nextLabel: null,
      pointsNeeded: 0,
      progress: 100,
    };
  }

  const range = currentLevel.nextThreshold - currentLevel.minimum;
  const progressed = Math.max(totalScore - currentLevel.minimum, 0);

  return {
    nextLabel: currentLevel.nextLabel,
    pointsNeeded: Math.max(currentLevel.nextThreshold - totalScore, 0),
    progress: Math.min(Math.round((progressed / range) * 100), 100),
  };
};

function StatTile({ label, value, tone = 'slate' }) {
  const toneClass = {
    emerald: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    amber: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    cyan: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
    blue: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
    slate: 'border-slate-800 bg-slate-950/60 text-slate-100',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function VerificationSummaryCard({ profile, userId, emailVerified, onProfileUpdate }) {
  const [savingPhoneStatus, setSavingPhoneStatus] = useState(false);
  const [error, setError] = useState('');

  const resolvedProfile = useMemo(
    () => ({
      ...profile,
      emailVerified: Boolean(emailVerified ?? profile?.emailVerified),
    }),
    [emailVerified, profile]
  );

  const { percentage, missing } = getProfileCompletion(resolvedProfile);
  const trustSummary = getTrustScoreSummary(resolvedProfile);
  const trustProgress = getTrustProgress(trustSummary.totalScore, trustSummary.level);

  const handlePhoneToggle = async () => {
    if (!userId) {
      return;
    }

    const nextPhoneVerified = !resolvedProfile.phoneVerified;
    setSavingPhoneStatus(true);
    setError('');

    try {
      await setDoc(doc(db, 'users', userId), { phoneVerified: nextPhoneVerified }, { merge: true });

      if (onProfileUpdate) {
        onProfileUpdate({ phoneVerified: nextPhoneVerified });
      }
    } catch (toggleError) {
      setError(toggleError.message || 'Unable to update phone verification.');
    } finally {
      setSavingPhoneStatus(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Verification Summary</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Your trust and verification status</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Track what is already verified, what still needs attention, and how close you are to the next trust level.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right text-cyan-100">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Trust Score</p>
          <p className="mt-2 text-3xl font-semibold">{trustSummary.totalScore}</p>
          <p className="text-sm">{trustSummary.level}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Email Verified"
          value={resolvedProfile.emailVerified ? 'Verified ✓' : 'Not verified'}
          tone={resolvedProfile.emailVerified ? 'emerald' : 'slate'}
        />
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone Verified</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">
                {resolvedProfile.phoneVerified ? 'Verified ✓' : 'Pending'}
              </p>
              <p className="mt-1 text-sm text-slate-400">MVP toggle for demo verification.</p>
            </div>
            <button
              type="button"
              onClick={handlePhoneToggle}
              disabled={savingPhoneStatus}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                resolvedProfile.phoneVerified
                  ? 'bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {savingPhoneStatus ? 'Saving...' : resolvedProfile.phoneVerified ? 'Turn off' : 'Mark verified'}
            </button>
          </div>
        </div>
        <StatTile label="Profile Complete" value={`${percentage}%`} tone="cyan" />
        <StatTile label="Endorsements Received" value={trustSummary.endorsementCount} tone="amber" />
        <StatTile label="Reviews Received" value={trustSummary.reviewCount} tone="blue" />
        <StatTile label="Trust Level" value={trustSummary.level} tone="cyan" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next Trust Level</p>
            {trustProgress.nextLabel ? (
              <>
                <p className="mt-2 text-xl font-semibold text-white">{trustProgress.nextLabel}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {trustProgress.pointsNeeded} more point{trustProgress.pointsNeeded === 1 ? '' : 's'} needed.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-xl font-semibold text-white">Highest level reached</p>
                <p className="mt-1 text-sm text-slate-400">This profile is already at the top trust tier.</p>
              </>
            )}
          </div>
          <p className="text-sm text-slate-400">{trustProgress.progress}% progress in this tier</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${trustProgress.progress}%` }} />
        </div>
      </div>

      {missing.length ? (
        <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Complete Your Profile</p>
          <p className="mt-2 text-sm text-amber-100">
            Finishing these items will improve your profile quality and help raise your trust score.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((item) => (
              <span key={item.key} className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm">
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </section>
  );
}