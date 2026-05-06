import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LoginView from './views/LoginView'
import AnalyticsView from './views/AnalyticsView'
import CardsView from './views/CardsView'
import PresetsView from './views/PresetsView'
import SafetyGameView from './views/SafetyGameView'
import Sidebar from './components/layout/Sidebar'

const VIEWS = ['analytics', 'cards', 'presets']

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('analytics')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-lg font-body">Loading…</div>
      </div>
    )
  }

  if (!session) return <LoginView />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeView={activeView} onNavigate={setActiveView} session={session} />
      <main className="flex-1 p-8 overflow-y-auto">
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'cards'     && <CardsView />}
        {activeView === 'presets'   && <PresetsView />}
        {activeView === 'safety'    && <SafetyGameView />}
      </main>
    </div>
  )
}
