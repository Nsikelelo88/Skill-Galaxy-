import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import OpportunityFeed from './components/Opportunities/OpportunityFeed'
import CreateProfile from './components/Profile/CreateProfile'
import ProfileDirectory from './components/Profile/ProfileDirectory'
import ProfileView from './components/Profile/ProfileView'
import VerifyProfile from './components/Verification/VerifyProfile'

const navigation = [
  { to: '/create-profile', label: 'Create Profile' },
  { to: '/profile', label: 'Profile' },
  { to: '/profiles', label: 'Browse Profiles' },
  { to: '/opportunities', label: 'Opportunities' },
]

function App() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/80 px-8 py-6 text-lg font-medium text-cyan-200 shadow-2xl shadow-cyan-950/30">
          Loading Skill Galaxy...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 p-8 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                Skill Galaxy
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Verified talent profiles, skill proof, and matched opportunities.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Auth-aware routing is now in place so users are redirected to the right flow for login, onboarding, profile management, and opportunities.
              </p>
            </div>
            <div className="flex flex-col gap-4 lg:items-end">
              <nav className="flex flex-wrap gap-3">
                {(user
                  ? navigation
                  : [
                      { to: '/login', label: 'Login' },
                      { to: '/register', label: 'Register' },
                    ]).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              {user ? (
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-cyan-100">
                    {user.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-5xl">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/profile" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/create-profile" replace />} />
            <Route
              path="/create-profile"
              element={user ? <CreateProfile /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={user ? <ProfileView /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profiles"
              element={user ? <ProfileDirectory /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/opportunities"
              element={user ? <OpportunityFeed /> : <Navigate to="/login" replace />}
            />
            <Route path="/verify/:uid" element={<VerifyProfile />} />
            <Route
              path="/"
              element={<Navigate to={user ? '/profile' : '/login'} replace />}
            />
            <Route path="*" element={<Navigate to={user ? '/profile' : '/login'} replace />} />
          </Routes>
        </div>
      </div>
    </main>
  )
}


export default App
