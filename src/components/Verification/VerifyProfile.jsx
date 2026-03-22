import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function VerifyProfile() {
  const { uid } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'users', uid));

        if (!snapshot.exists()) {
          setError('This profile could not be found.');
          return;
        }

        setProfile(snapshot.data());
      } catch (verificationError) {
        setError('Verification is currently limited by your Firestore access rules.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [uid]);

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-50">
      <div className="w-full max-w-2xl rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 p-8 shadow-2xl shadow-cyan-950/30">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Skill Verification</p>
        <h1 className="mt-4 text-3xl font-bold text-white">{profile.name}</h1>
        <p className="mt-2 text-slate-300">{profile.userType === 'youth' ? 'Job Seeker' : 'Skilled Worker'}</p>

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
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.skills?.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}