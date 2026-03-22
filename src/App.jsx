import { Link, Route, Routes } from 'react-router-dom'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import OpportunityFeed from './components/Opportunities/OpportunityFeed'
import CreateProfile from './components/Profile/CreateProfile'
import EvidenceUpload from './components/Profile/EvidenceUpload'
import SkillList from './components/Profile/SkillList'
import QRCode from './components/Verification/QRCode'
import ShareProfile from './components/Verification/ShareProfile'

const navigation = [
  { to: '/', label: 'Overview' },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
  { to: '/profile', label: 'Profile' },
  { to: '/opportunities', label: 'Opportunities' },
]

function HomePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="grid gap-6">
        <CreateProfile />
        <SkillList />
        <EvidenceUpload />
      </div>
      <div className="grid gap-6">
        <QRCode />
        <ShareProfile />
      </div>
    </div>
  )
}

function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 p-8 shadow-2xl shadow-cyan-950/30">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                Skill Galaxy Hackathon
              </span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Project skeleton for auth, profiles, verification, and opportunities.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                The rough folder structure now exists with placeholder screens so you can replace each section with real product logic incrementally.
              </p>
            </div>
            <nav className="flex flex-wrap gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<HomePage />} />
          <Route path="/opportunities" element={<OpportunityFeed />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
