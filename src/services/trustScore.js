import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const badgeConfig = {
  Starter: {
    label: 'Starter',
    color: 'bg-slate-500/20 text-slate-300 border-slate-400/30',
    progress: 'bg-slate-400',
    icon: '○',
  },
  Emerging: {
    label: 'Emerging',
    color: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    progress: 'bg-amber-400',
    icon: '◔',
  },
  Verified: {
    label: 'Verified',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    progress: 'bg-emerald-400',
    icon: '◕',
  },
  Trusted: {
    label: 'Trusted',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    progress: 'bg-cyan-400',
    icon: '⬢',
  },
};

const TRUST_SCORE_CACHE_TTL_MS = 60 * 1000;
const trustScoreCache = new Map();

const clamp = (value, maximum) => Math.min(value, maximum);

export const getTrustBadge = (totalScore) => {
  if (totalScore > 100) {
    return badgeConfig.Trusted;
  }

  if (totalScore >= 71) {
    return badgeConfig.Verified;
  }

  if (totalScore >= 31) {
    return badgeConfig.Emerging;
  }

  return badgeConfig.Starter;
};

export const deriveTrustScore = (profile = {}) => {
  const profileCompletionScore =
    (profile.name ? 5 : 0) +
    (profile.location ? 5 : 0) +
    (profile.photoURL || profile.profilePhoto || profile.avatarUrl ? 10 : 0);

  const skillsScore = clamp((profile.skills?.length || 0) * 5, 25);
  const endorsementCount = profile.endorsementCount || 0;
  const reviewCount = profile.reviewCount || 0;
  const peerEndorsementScore = clamp(endorsementCount * 5, 30);
  const clientReviewScore = clamp(reviewCount * 5, 25);
  const totalScore = profileCompletionScore + skillsScore + peerEndorsementScore + clientReviewScore;
  const badge = getTrustBadge(totalScore);

  return {
    totalScore,
    percentage: Math.min(totalScore, 100),
    level: badge.label,
    badge,
    endorsementCount,
    reviewCount,
    breakdown: {
      profileCompletionScore,
      skillsScore,
      peerEndorsementScore,
      clientReviewScore,
    },
  };
};

export const getTrustScoreSummary = (profile = {}) => {
  if (typeof profile.trustScore === 'number' && profile.trustBreakdown) {
    return {
      totalScore: profile.trustScore,
      percentage: Math.min(profile.trustScore, 100),
      level: profile.trustLevel || getTrustBadge(profile.trustScore).label,
      badge: getTrustBadge(profile.trustScore),
      endorsementCount: profile.endorsementCount || 0,
      reviewCount: profile.reviewCount || 0,
      breakdown: profile.trustBreakdown,
    };
  }

  return deriveTrustScore(profile);
};

export async function calculateTrustScore(userId, options = {}) {
  const { forceRefresh = false, persist = auth.currentUser?.uid === userId } = options;

  if (!userId) {
    throw new Error('A user ID is required to calculate trust score.');
  }

  const cachedResult = trustScoreCache.get(userId);

  if (!forceRefresh && cachedResult && Date.now() - cachedResult.cachedAt < TRUST_SCORE_CACHE_TTL_MS) {
    return cachedResult.value;
  }

  const userRef = doc(db, 'users', userId);
  const endorsementsQuery = query(collection(db, 'endorsements'), where('toUserId', '==', userId));
  const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));

  const [profileSnapshot, endorsementsSnapshot, reviewsSnapshot] = await Promise.all([
    getDoc(userRef),
    getCountFromServer(endorsementsQuery),
    getCountFromServer(reviewsQuery),
  ]);

  if (!profileSnapshot.exists()) {
    throw new Error('Unable to calculate trust score for a missing profile.');
  }

  const result = deriveTrustScore({
    ...profileSnapshot.data(),
    endorsementCount: endorsementsSnapshot.data().count,
    reviewCount: reviewsSnapshot.data().count,
  });

  trustScoreCache.set(userId, {
    cachedAt: Date.now(),
    value: result,
  });

  if (persist) {
    await setDoc(
      userRef,
      {
        endorsementCount: result.endorsementCount,
        reviewCount: result.reviewCount,
        trustScore: result.totalScore,
        trustLevel: result.level,
        trustBreakdown: result.breakdown,
        trustScoreUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  return result;
}

export function clearTrustScoreCache(userId) {
  if (userId) {
    trustScoreCache.delete(userId);
    return;
  }

  trustScoreCache.clear();
}