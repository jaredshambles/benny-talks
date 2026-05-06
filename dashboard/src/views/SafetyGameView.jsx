// dashboard/src/views/SafetyGameView.jsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import SafetyCardForm from '../components/safety/SafetyCardForm'
import SafetyDeckManager from '../components/safety/SafetyDeckManager'

const SUB_TABS = ['Cards', 'Themes']

export default function SafetyGameView() {
  const [subTab, setSubTab] = useState('Cards')
  const [cards, setCards]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadCards = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('safety_cards').select('*').order('sort_order')
    setCards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  async function handleDelete(id) {
    if (!confirm('Delete this card?')) return
    await supabase.from('safety_cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🛡️ Safety Game</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage cards and themed decks</p>
        </div>
        {subTab === 'Cards' && (
          <button onClick={() => setShowForm(v => !v)}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition">
            {showForm ? 'Cancel' : '+ Add Card'}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => { setSubTab(t); setShowForm(false) }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${subTab === t ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Cards' && (
        <>
          {showForm && (
            <SafetyCardForm
              onSaved={() => { setShowForm(false); loadCards() }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Card</th>
                    <th className="text-left px-5 py-3">Answer</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cards.map(card => (
                    <tr key={card.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {card.img_url
                            ? <img src={card.img_url} alt={card.label} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                            : <span className="text-2xl">{card.emoji}</span>}
                          <span className="font-medium text-slate-700">{card.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${card.is_safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {card.is_safe ? '✅ Safe' : '🚫 Not Safe'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDelete(card.id)} className="text-slate-400 hover:text-red-500 transition text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cards.length === 0 && <div className="px-5 py-10 text-center text-slate-400 text-sm">No safety cards yet.</div>}
            </div>
          )}
        </>
      )}

      {subTab === 'Themes' && <SafetyDeckManager allCards={cards} />}
    </div>
  )
}
