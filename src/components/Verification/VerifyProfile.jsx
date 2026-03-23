import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import ClientReview from '../Profile/ClientReview';
import EndorsementButton from '../Profile/EndorsementButton';
import ReviewModal from '../Profile/ReviewModal';
import TrustScore from '../Profile/TrustScore';
import VerificationBadges from '../Profile/VerificationBadges';
import { calculateTrustScore } from '../../services/trustScore';

export default function VerifyProfile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribeEndorsements = () => {};
    let unsubscribeReviews = () => {};

    const refreshTrustScore = async (userId) => {
      const trustScoreData = await calculateTrustScore(userId, { forceRefresh: true, persist: false });

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              endorsementCount: trustScoreData.endorsementCount,
              reviewCount: trustScoreData.reviewCount,
              trustScore: trustScoreData.totalScore,
              trustLevel: trustScoreData.level,
              trustBreakdown: trustScoreData.breakdown,
            }
          : currentProfile
      );
    };

    const fetchProfile = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', uid));

        if (!snapshot.exists()) {
          setError('This profile could not be found.');
          return;
        }

        setProfile(snapshot.data());
        await refreshTrustScore(uid);

        const endorsementsQuery = query(
          collection(db, 'endorsements'),
          where('toUserId', '==', uid)
        );

        unsubscribeEndorsements = onSnapshot(endorsementsQuery, async (endorsementSnapshot) => {
          setProfile((currentProfile) =>
            currentProfile
              ? {
                  ...currentProfile,
                  endorsementCount: endorsementSnapshot.size,
                }
              : currentProfile
          );

          await refreshTrustScore(uid);
        });

        const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', uid));

        unsubscribeReviews = onSnapshot(reviewsQuery, async (reviewSnapshot) => {
          const reviews = reviewSnapshot.docs.map((reviewDoc) => reviewDoc.data());
          const averageRating = reviews.length
            ? Number((reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1))
            : 0;

          setReviews(reviews);

          setProfile((currentProfile) =>
            currentProfile
              ? {
                  ...currentProfile,
                  reviewCount: reviews.length,
                  averageRating,
                }
              : currentProfile
          );

          await refreshTrustScore(uid);
        });
      } catch (verificationError) {
        setError('Verification is currently limited by your Firestore access rules.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      unsubscribeEndorsements();
      unsubscribeReviews();
    };
  }, [uid]);

  const isOwnProfile = auth.currentUser?.uid === uid;
  const sortedReviews = useMemo(
    () => reviews.slice().sort((left, right) => (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0)),
    [reviews]
  );

  const handleOpenReview = () => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    if (isOwnProfile) {
      return;
    }

    setIsReviewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
        <div className="text-cyan-300">Loading verification profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
        <div className="max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Verification Unavailable</h1>
          <p className="mt-4 text-slate-300">{error}</p>
          <Link
            to="/login"
            className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
        <div className="w-full max-w-3xl rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 p-8 shadow-2xl shadow-cyan-950/30">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Skill Verification</p>
        <h1 className="mt-4 text-3xl font-bold text-white">{profile.name}</h1>
        <p className="mt-2 text-slate-300">{profile.userType === 'youth' ? 'Job Seeker' : 'Skilled Worker'}</p>
        <div className="mt-4">
          <VerificationBadges profile={profile} />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
            <p className="mt-2 text-sm text-slate-200">{profile.location}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Profile Status</p>
            <p className="mt-2 text-sm text-emerald-300">Verified profile created</p>
          </div>
        </div>

        <div className="mt-8">
          <TrustScore profile={profile} />
        </div>

        <div className="mt-8">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Skills</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.skills?.map((skill) => (
              <div
                key={skill}
                className="flex items-center justify-between gap-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100"
              >
                <span>{skill}</span>
                <EndorsementButton toUserId={uid} skill={skill} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Ratings and Reviews</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Leave feedback for this profile</h2>
              <p className="mt-2 text-sm text-slate-400">
                Signed-in users can rate and review another profile once.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenReview}
              disabled={isOwnProfile}
              className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!auth.currentUser ? 'Sign in to review' : isOwnProfile ? 'You cannot review yourself' : 'Leave rating and review'}
            </button>
          </div>

          <div className="mt-6">
            <ClientReview userId={uid} reviews={sortedReviews} hideForm compact />
          </div>
        </div>
      </div>
      </div>

      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Leave a review for ${profile.name}`}>
        <ClientReview userId={uid} reviews={sortedReviews} />
      </ReviewModal>
    </>
  );
}