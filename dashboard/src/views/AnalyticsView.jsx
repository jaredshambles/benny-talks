import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DailyActivityChart from '../components/charts/DailyActivityChart'
import TapFrequencyChart from '../components/charts/TapFrequencyChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'

const RANGES = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AnalyticsView() {
  const [range, setRange] = useState(7)
  const [tapLogs, setTapLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const since = new Date()
      since.setDate(since.getDate() - range)

      const { data } = await supabase
        .from('tap_log')
        .select('*')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })

      setTapLogs(data ?? [])
      setLoading(false)
    }
    load()
  }, [range])

  // --- derived data ---

  const cardTaps = tapLogs.filter(r => r.event_type === 'card_tap')
  const routineCompletions = tapLogs.filter(r => r.event_type === 'routine_complete')

  // Daily taps
  const dailyMap = {}
  cardTaps.forEach(r => {
    const d = r.created_at.slice(0, 10)
    dailyMap[d] = (dailyMap[d] ?? 0) + 1
  })
  const dailyData = Object.entries(dailyMap).map(([date, taps]) => ({
    date: date.slice(5), // MM-DD
    taps,
  }))

  // Top cards
  const cardMap = {}
  cardTaps.forEach(r => {
    const key = r.card_label ?? 'Unknown'
    cardMap[key] = (cardMap[key] ?? 0) + 1
  })
  const topCards = Object.entries(cardMap)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  // Category breakdown
  const catMap = {}
  cardTaps.forEach(r => {
    const cat = r.category ?? 'unknown'
    catMap[cat] = (catMap[cat] ?? 0) + 1
  })
  const categoryData = Object.entries(catMap).map(([category, count]) => ({ category, count }))

  const customTaps = cardTaps.filter(r => r.is_custom).length
  const customPct = cardTaps.length ? Math.round((customTaps / cardTaps.length) * 100) : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
          <p className="text-slate-500 text-sm mt-0.5">Benny's communication activity</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition
                ${range === r.days ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading…</div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total taps" value={cardTaps.length} sub={`last ${range} days`} />
            <StatCard label="Unique words" value={Object.keys(cardMap).length} />
            <StatCard label="Routines done" value={routineCompletions.length} />
            <StatCard label="Custom card use" value={`${customPct}%`} sub={`${customTaps} taps`} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Daily Taps</h3>
              <DailyActivityChart data={dailyData} />
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">By Category</h3>
              <CategoryPieChart data={categoryData} />
            </div>
          </div>

          {/* Top cards chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
            <h3 className="font-semibold text-slate-700 mb-4">Most Used Words</h3>
            {topCards.length ? <TapFrequencyChart data={topCards} /> : <p className="text-slate-400 text-sm">No data yet.</p>}
          </div>

          {/* Recent routine completions */}
          {routineCompletions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-700 mb-4">Recent Routines</h3>
              <div className="divide-y divide-slate-50">
                {routineCompletions.slice(-20).reverse().map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2.5">
                    <span className="text-sm text-slate-700 font-medium">{r.routine_name ?? 'Routine'}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
