import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { auth, db } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import EvidenceUpload from './EvidenceUpload';

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate('/login');
        return;
      }

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      } else {
        navigate('/create-profile');
      }

      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const profileUrl = `${window.location.origin}/verify/${auth.currentUser?.uid}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-cyan-300">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-300">My Skill Galaxy</h1>
          <p className="text-gray-400">Your verified skills profile</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  profile.userType === 'youth'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-orange-500/20 text-orange-400'
                }`}
              >
                {profile.userType === 'youth' ? 'Job Seeker' : 'Skilled Worker'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Name</label>
                <p className="text-lg font-medium">{profile.name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Location</label>
                <p className="text-lg font-medium">{profile.location}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Email</label>
                <p className="text-lg font-medium">{profile.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Skills</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills?.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-cyan-300/20 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center">
            <h2 className="text-xl font-semibold mb-4">Verify My Skills</h2>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QRCodeSVG value={profileUrl} size={180} />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Share this QR code with employers to verify your skills
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(profileUrl)}
              className="px-4 py-2 bg-cyan-300/20 border border-cyan-300 rounded-lg text-cyan-300 hover:bg-cyan-300/30 transition"
            >
              Copy Profile Link
            </button>
          </div>
        </div>

        <div className="mt-8">
          <EvidenceUpload />
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/opportunities')}
            className="px-8 py-3 rounded-lg font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
          >
            Find Opportunities
          </button>
        </div>
      </div>
    </div>
  );
}