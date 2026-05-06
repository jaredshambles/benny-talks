import { supabase } from '../../lib/supabase'

const NAV = [
  { id: 'analytics', label: 'Analytics',   icon: '📊' },
  { id: 'cards',     label: 'Cards',       icon: '🃏' },
  { id: 'presets',   label: 'Presets',     icon: '📋' },
  { id: 'safety',    label: 'Safety Game', icon: '🛡️' },
]

export default function Sidebar({ activeView, onNavigate, session }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-slate-100 min-h-screen">
      <div className="px-6 pt-8 pb-6 border-b border-slate-100">
        <div className="text-3xl mb-1">🗣️</div>
        <h1 className="font-display text-lg text-slate-800 leading-tight">Benny Talks</h1>
        <p className="text-xs text-slate-400 mt-0.5">Dashboard</p>
      </div>

      <nav className="flex-1 py-4 px-3">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold mb-1 transition
              ${activeView === item.id
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-4 pb-6 border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-400 truncate mb-3">{session.user.email}</p>
        <button
          onClick={handleSignOut}
          className="w-full text-xs font-semibold text-slate-500 hover:text-red-500 transition text-left px-1"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
