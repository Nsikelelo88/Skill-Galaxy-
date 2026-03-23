import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import EvidenceUpload from './EvidenceUpload';
import ClientReview from './ClientReview';
import TrustScore from './TrustScore';
import VerificationBadges from './VerificationBadges';
import VerificationSummaryCard from './VerificationSummaryCard';
import EndorsementButton from './EndorsementButton';
import ReviewModal from './ReviewModal';
import { calculateTrustScore } from '../../services/trustScore';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-5xl animate-pulse space-y-8">
        <div className="h-56 rounded-[2rem] border border-white/10 bg-white/5" />
        <div className="grid gap-8 lg:grid-cols-[1.3fr,0.9fr]">
          <div className="h-72 rounded-[2rem] border border-white/10 bg-white/5" />
          <div className="h-72 rounded-[2rem] border border-white/10 bg-white/5" />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="h-96 rounded-[2rem] border border-white/10 bg-white/5" />
          <div className="h-96 rounded-[2rem] border border-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  );
}

const getAverageRating = (reviews) => {
  if (!reviews.length) {
    return 0;
  }

  return Number((reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1));
};

const getSkillEndorsementCounts = (skills = [], endorsements = []) => {
  const counts = Object.fromEntries(skills.map((skill) => [skill, 0]));

  endorsements.forEach((endorsement) => {
    counts[endorsement.skill] = (counts[endorsement.skill] || 0) + 1;
  });

  return counts;
};

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [skillEndorsementCounts, setSkillEndorsementCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const navigate = useNavigate();

  const applyProfilePatch = (patch) => {
    setProfile((currentProfile) => (currentProfile ? { ...currentProfile, ...patch } : currentProfile));
  };

  useEffect(() => {
    let unsubscribeEndorsements = () => {};
    let unsubscribeReviews = () => {};

    const refreshTrustScore = async (userId, options = {}) => {
      const trustScoreData = await calculateTrustScore(userId, options);

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
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const endorsementsQuery = query(collection(db, 'endorsements'), where('toUserId', '==', user.uid));
      const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', user.uid));

      const [docSnap, endorsementsSnapshot, reviewsSnapshot, trustScoreData] = await Promise.all([
        getDoc(docRef),
        getDocs(endorsementsQuery),
        getDocs(reviewsQuery),
        calculateTrustScore(user.uid, { forceRefresh: true, persist: true }),
      ]);

      if (docSnap.exists()) {
        const endorsementDocs = endorsementsSnapshot.docs.map((snapshot) => snapshot.data());
        const reviewDocs = reviewsSnapshot.docs.map((snapshot) => snapshot.data());
        const nextProfile = {
          ...docSnap.data(),
          emailVerified: user.emailVerified || docSnap.data().emailVerified || false,
          phoneVerified: docSnap.data().phoneVerified || false,
          endorsementCount: trustScoreData.endorsementCount,
          reviewCount: trustScoreData.reviewCount,
          trustScore: trustScoreData.totalScore,
          trustLevel: trustScoreData.level,
          trustBreakdown: trustScoreData.breakdown,
          averageRating: getAverageRating(reviewDocs),
        };

        setProfile(nextProfile);
        setReviews(reviewDocs);
        setSkillEndorsementCounts(getSkillEndorsementCounts(nextProfile.skills, endorsementDocs));

        await setDoc(
          docRef,
          {
            emailVerified: nextProfile.emailVerified,
            phoneVerified: nextProfile.phoneVerified,
          },
          { merge: true }
        );

        unsubscribeEndorsements = onSnapshot(endorsementsQuery, async (snapshot) => {
          const endorsementDocs = snapshot.docs.map((endorsementDoc) => endorsementDoc.data());

          setProfile((currentProfile) =>
            currentProfile
              ? {
                  ...currentProfile,
                  endorsementCount: snapshot.size,
                }
              : currentProfile
          );

          setSkillEndorsementCounts((currentCounts) =>
            getSkillEndorsementCounts(Object.keys(currentCounts).length ? Object.keys(currentCounts) : nextProfile.skills, endorsementDocs)
          );

          await refreshTrustScore(user.uid, { forceRefresh: true, persist: true });
        });

        unsubscribeReviews = onSnapshot(reviewsQuery, async (snapshot) => {
          const reviewDocs = snapshot.docs.map((reviewDoc) => reviewDoc.data());
          const averageRating = getAverageRating(reviewDocs);

          setReviews(reviewDocs);

          setProfile((currentProfile) =>
            currentProfile
              ? {
                  ...currentProfile,
                  reviewCount: reviewDocs.length,
                  averageRating,
                }
              : currentProfile
          );

          await refreshTrustScore(user.uid, { forceRefresh: true, persist: true });
        });
      } else {
        navigate('/create-profile');
      }

      setLoading(false);
    };

    fetchProfile();

    return () => {
      unsubscribeEndorsements();
      unsubscribeReviews();
    };
  }, [navigate]);

  const profileUrl = `${window.location.origin}/verify/${auth.currentUser?.uid}`;
  const sortedReviews = useMemo(
    () => reviews.slice().sort((left, right) => (right.createdAt?.seconds || 0) - (left.createdAt?.seconds || 0)),
    [reviews]
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <VerificationSummaryCard
            profile={profile}
            userId={auth.currentUser?.uid}
            emailVerified={auth.currentUser?.emailVerified}
            onProfileUpdate={applyProfilePatch}
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr,0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">My Skill Galaxy</p>
                  <h1 className="mt-3 text-3xl font-bold text-cyan-300">{profile.name}</h1>
                  <p className="mt-2 text-gray-400">Your verified skills profile</p>
                  <div className="mt-4">
                    <VerificationBadges profile={profile} emailVerified={auth.currentUser?.emailVerified} />
                  </div>
                </div>
                <div className="w-full max-w-sm">
                  <TrustScore profile={profile} />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur-lg">
              <h2 className="mb-4 text-xl font-semibold">Verify My Skills</h2>
              <div className="mb-4 inline-block rounded-xl bg-white p-4">
                <QRCodeSVG value={profileUrl} size={180} />
              </div>
              <p className="mb-4 text-sm text-gray-400">
                Share this QR code with employers to verify your skills
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(profileUrl)}
                className="rounded-lg border border-cyan-300 bg-cyan-300/20 px-4 py-2 text-cyan-300 transition hover:bg-cyan-300/30"
              >
                Copy Profile Link
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Profile Details</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Public profile snapshot</h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    profile.userType === 'youth'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-orange-500/20 text-orange-400'
                  }`}
                >
                  {profile.userType === 'youth' ? 'Job Seeker' : 'Skilled Worker'}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-lg font-medium text-white">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Location</label>
                  <p className="text-lg font-medium text-white">{profile.location}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-lg font-medium text-white">{profile.email}</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Skills</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Skills with endorsements</h3>
                <div className="mt-4 grid gap-3">
                  {profile.skills?.map((skill) => (
                    <div
                      key={skill}
                      className="flex flex-col gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="text-base font-medium text-cyan-100">{skill}</p>
                        <p className="mt-1 text-sm text-cyan-200/80">
                          {skillEndorsementCounts[skill] || 0} endorsement{skillEndorsementCounts[skill] === 1 ? '' : 's'} received
                        </p>
                      </div>
                      <EndorsementButton toUserId={auth.currentUser?.uid} skill={skill} compact />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <EvidenceUpload />
              </div>
            </div>

            <div className="space-y-8">
              <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Reviews</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">What people are saying</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20"
                  >
                    Leave Review
                  </button>
                </div>

                <div className="mt-6">
                  <ClientReview userId={auth.currentUser?.uid} reviews={sortedReviews} hideForm compact />
                </div>
              </section>

              <div className="text-center">
                <button
                  onClick={() => navigate('/opportunities')}
                  className="rounded-lg bg-cyan-400 px-8 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Find Opportunities
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} title={`Leave a review for ${profile.name}`}>
        <ClientReview userId={auth.currentUser?.uid} reviews={sortedReviews} />
      </ReviewModal>
    </>
  );
}