import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

export default function CreateProfile() {
  const [userType, setUserType] = useState('youth');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addSkill = () => {
    const normalizedSkill = currentSkill.trim();

    if (normalizedSkill && !skills.includes(normalizedSkill)) {
      setSkills([...skills, normalizedSkill]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error('You must be signed in to create a profile.');
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email: user.email,
        emailVerified: user.emailVerified || false,
        phoneVerified: false,
        userType,
        location,
        skills,
        createdAt: new Date().toISOString(),
        profileComplete: true,
      });

      navigate('/profile');
    } catch (submissionError) {
      console.error('Error creating profile:', submissionError);
      setError(submissionError.message || 'Unable to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg">
        <h1 className="mb-2 text-3xl font-bold text-cyan-300">Create Your Profile</h1>
        <p className="mb-8 text-gray-400">Tell us about your skills and experience</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('youth')}
                className={`rounded-lg border-2 p-4 transition ${
                  userType === 'youth'
                    ? 'border-cyan-300 bg-cyan-300/10'
                    : 'border-white/20 hover:border-cyan-300/50'
                }`}
              >
                <div className="font-semibold">Youth / Job Seeker</div>
                <div className="text-sm text-gray-400">Looking for internships and careers</div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('informal')}
                className={`rounded-lg border-2 p-4 transition ${
                  userType === 'informal'
                    ? 'border-cyan-300 bg-cyan-300/10'
                    : 'border-white/20 hover:border-cyan-300/50'
                }`}
              >
                <div className="font-semibold">Skilled Worker</div>
                <div className="text-sm text-gray-400">Informal sector with experience</div>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-white focus:border-cyan-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Durban, KZN"
              className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-white focus:border-cyan-300 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Skills</label>
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder={
                  userType === 'youth'
                    ? 'e.g., Python, React, Design'
                    : 'e.g., Welding, Hairdressing, Plumbing'
                }
                className="flex-1 rounded-lg border border-white/20 bg-black/50 px-4 py-3 text-white focus:border-cyan-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-lg border border-cyan-300 px-6 py-3 text-cyan-300 transition hover:bg-cyan-300/20"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-2 rounded-full bg-cyan-950/70 px-3 py-1 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            {loading ? 'Creating Profile...' : 'Launch My Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}