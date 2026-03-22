import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-galaxy-teal to-galaxy-gold bg-clip-text text-transparent">
            Skill Galaxy
          </h1>
          <p className="text-gray-400 mt-2">Launch your career into orbit</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-galaxy-teal transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-galaxy-teal transition"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 galaxy-gradient rounded-lg font-semibold text-white hover:opacity-90 transition"
          >
            Launch into Skill Galaxy
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          New to Skill Galaxy?{' '}
          <Link to="/register" className="text-galaxy-teal hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}