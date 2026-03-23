import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const getReviewId = (reviewerId, userId) => `${reviewerId}_${userId}`;

const getAverageRating = (reviews) => {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
};

function StarButton({ filled, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-2xl transition ${filled ? 'text-amber-300' : 'text-slate-600'} disabled:cursor-not-allowed`}
      aria-label={filled ? 'Selected star' : 'Unselected star'}
    >
      ★
    </button>
  );
}

export default function ClientReview({ userId, reviews: externalReviews = null, hideForm = false, compact = false }) {
  const navigate = useNavigate();
  const reviewerId = auth.currentUser?.uid || null;
  const [internalReviews, setInternalReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const reviewsQuery = query(collection(db, 'reviews'), where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        setInternalReviews(snapshot.docs.map((reviewDoc) => reviewDoc.data()));

        setLoading(false);
      },
      () => {
        setError('Unable to load reviews.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const reviews = externalReviews ?? internalReviews;

  const hasReviewed = Boolean(reviewerId && reviews.some((review) => review.reviewerId === reviewerId));
  const isOwnProfile = reviewerId === userId;
  const reviewCount = reviews.length;
  const averageRating = useMemo(() => getAverageRating(reviews), [reviews]);
  const disabled = loading || submitting || hasReviewed || isOwnProfile;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!reviewerId) {
      navigate('/login');
      return;
    }

    if (hasReviewed || isOwnProfile) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reviewId = getReviewId(reviewerId, userId);

      await setDoc(doc(db, 'reviews', reviewId), {
        id: reviewId,
        userId,
        reviewerId,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });

      setComment('');
      setRating(5);
    } catch (reviewError) {
      setError(reviewError.message || 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Client Reviews</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-3xl font-semibold text-white">{averageRating.toFixed(1)}</span>
            <span className="pb-1 text-sm text-slate-400">Average rating from {reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
          </div>
        </div>
        <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
          {reviewCount} total review{reviewCount === 1 ? '' : 's'}
        </div>
      </div>

      {!hideForm ? <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <p className="text-sm text-slate-300">Rate this worker</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <StarButton
                key={value}
                filled={value <= rating}
                onClick={() => setRating(value)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="client-review-comment" className="text-sm text-slate-300">
            Review
          </label>
          <textarea
            id="client-review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            maxLength={300}
            placeholder="Share what this person did well."
            disabled={disabled}
            className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={disabled}
            className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-medium text-amber-200 transition hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Submitting review...'
              : !reviewerId
                ? 'Sign in to review'
                : isOwnProfile
                  ? 'You cannot review yourself'
                  : hasReviewed
                    ? 'Review already submitted'
                    : 'Submit review'}
          </button>
          {error ? <p className="text-xs text-red-400">{error}</p> : null}
        </div>
      </form> : null}

      <div className="mt-6 space-y-3">
        {reviews.length ? (
          reviews
            .slice()
            .sort((left, right) => {
              const leftSeconds = left.createdAt?.seconds || 0;
              const rightSeconds = right.createdAt?.seconds || 0;
              return rightSeconds - leftSeconds;
            })
            .slice(0, compact ? 3 : reviews.length)
            .map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-white">Reviewer {review.reviewerId.slice(0, 6)}</p>
                  <p className="text-sm text-amber-300">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                </div>
                <p className="mt-3 text-sm text-slate-300">{review.comment || 'No written comment provided.'}</p>
              </article>
            ))
        ) : (
          <p className="text-sm text-slate-400">No client reviews yet.</p>
        )}
      </div>
    </section>
  );
}