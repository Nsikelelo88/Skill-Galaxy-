import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const getEndorsementId = (fromUserId, toUserId, skill) => {
  const normalizedSkill = skill.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${fromUserId}_${toUserId}_${normalizedSkill}`;
};

const getEndorsementLabel = ({ currentUserId, toUserId, hasEndorsed, count, loading }) => {
  if (loading) {
    return 'Loading endorsements...';
  }

  if (!currentUserId) {
    return `Sign in to endorse (${count})`;
  }

  if (currentUserId === toUserId) {
    return `Your skill (${count})`;
  }

  if (hasEndorsed) {
    return `Endorsed (${count})`;
  }

  return `Endorse skill (${count})`;
};

export default function EndorsementButton({ toUserId, skill, compact = false }) {
  const navigate = useNavigate();
  const currentUserId = auth.currentUser?.uid || null;
  const [count, setCount] = useState(0);
  const [hasEndorsed, setHasEndorsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const endorsementsQuery = query(
      collection(db, 'endorsements'),
      where('toUserId', '==', toUserId),
      where('skill', '==', skill)
    );

    const unsubscribe = onSnapshot(
      endorsementsQuery,
      (snapshot) => {
        setCount(snapshot.size);
        setHasEndorsed(
          currentUserId ? snapshot.docs.some((docSnapshot) => docSnapshot.data().fromUserId === currentUserId) : false
        );
        setLoading(false);
      },
      () => {
        setError('Unable to load endorsements.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentUserId, skill, toUserId]);

  const isOwnProfile = currentUserId === toUserId;
  const disabled = loading || submitting || isOwnProfile || hasEndorsed;

  const label = useMemo(
    () => getEndorsementLabel({ currentUserId, toUserId, hasEndorsed, count, loading }),
    [count, currentUserId, hasEndorsed, loading, toUserId]
  );

  const handleEndorse = async () => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    if (isOwnProfile || hasEndorsed) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const endorsementId = getEndorsementId(currentUserId, toUserId, skill);

      await setDoc(doc(db, 'endorsements', endorsementId), {
        id: endorsementId,
        fromUserId: currentUserId,
        toUserId,
        skill,
        createdAt: serverTimestamp(),
      });
    } catch (endorsementError) {
      setError(endorsementError.message || 'Unable to submit endorsement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleEndorse}
        disabled={disabled}
        className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-200 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? 'Submitting...'
          : compact
            ? hasEndorsed
              ? 'Endorsed'
              : isOwnProfile
                ? 'Your skill'
                : 'Endorse'
            : label}
      </button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}