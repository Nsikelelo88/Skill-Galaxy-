import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import VerificationBadges from './VerificationBadges';
import { getTrustScoreSummary } from '../../services/trustScore';

function DirectorySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
      ))}
    </div>
  );
}

export default function ProfileDirectory() {
  const [profiles, setProfiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userType, setUserType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'users'));
        const currentUserId = auth.currentUser?.uid;

        setProfiles(
          snapshot.docs
            .map((docSnapshot) => docSnapshot.data())
            .filter((profile) => profile.uid && profile.uid !== currentUserId)
        );
      } catch (directoryError) {
        setError(directoryError.message || 'Unable to load profiles.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesType = userType === 'all' || profile.userType === userType;
      const haystack = [profile.name, profile.location, ...(profile.skills || [])]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch);

      return matchesType && matchesSearch;
    });
  }, [profiles, searchTerm, userType]);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Profile Directory</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Browse talent profiles</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Search for other users, inspect their trust signals, and open their verification page to leave endorsements or reviews.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr,220px]">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, location, or skill"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            />
            <select
              value={userType}
              onChange={(event) => setUserType(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
            >
              <option value="all">All profiles</option>
              <option value="youth">Job seekers</option>
              <option value="informal">Skilled workers</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          {loading ? <DirectorySkeleton /> : null}

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">{error}</div>
          ) : null}

          {!loading && !error ? (
            filteredProfiles.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProfiles.map((profile) => {
                  const trustSummary = getTrustScoreSummary(profile);

                  return (
                    <article
                      key={profile.uid}
                      className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{profile.userType === 'youth' ? 'Job Seeker' : 'Skilled Worker'}</p>
                          <h2 className="mt-2 text-2xl font-semibold text-white">{profile.name}</h2>
                          <p className="mt-2 text-sm text-slate-300">{profile.location || 'Location not provided'}</p>
                        </div>
                        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-right text-cyan-100">
                          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Trust</p>
                          <p className="mt-2 text-2xl font-semibold">{trustSummary.totalScore}</p>
                          <p className="text-sm">{trustSummary.level}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <VerificationBadges profile={profile} />
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {(profile.skills || []).slice(0, 6).map((skill) => (
                          <span key={skill} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4 text-sm text-slate-400">
                        <span>{profile.endorsementCount || 0} endorsements</span>
                        <span>{profile.reviewCount || 0} reviews</span>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to={`/verify/${profile.uid}`}
                          className="rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                        >
                          View and review profile
                        </Link>
                        <Link
                          to={`/verify/${profile.uid}`}
                          className="rounded-full border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                        >
                          Open verification page
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-300">
                No matching profiles found.
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}