import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PRESET_ICONS = {
  '🏠': 'bg-blue-50',
  '🎓': 'bg-purple-50',
  '👵': 'bg-pink-50',
  '🚗': 'bg-green-50',
}

export default function PresetsView() {
  const [presets, setPresets] = useState([])
  const [allCards, setAllCards] = useState([])
  const [presetCards, setPresetCards] = useState([]) // { id, preset_id, card_id, sort_order }
  const [loading, setLoading] = useState(true)
  const [openPreset, setOpenPreset] = useState(null)
  const [adding, setAdding] = useState(null) // card id being added

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: c }, { data: pc }] = await Promise.all([
        supabase.from('presets').select('*').order('sort_order'),
        supabase.from('cards').select('id, label, emoji, category').order('sort_order'),
        supabase.from('preset_cards').select('*'),
      ])
      setPresets(p ?? [])
      setAllCards(c ?? [])
      setPresetCards(pc ?? [])
      setLoading(false)
      if (p?.length) setOpenPreset(p[0].id)
    }
    load()
  }, [])

  function cardsForPreset(presetId) {
    const ids = presetCards.filter(pc => pc.preset_id === presetId).map(pc => pc.card_id)
    return allCards.filter(c => ids.includes(c.id))
  }

  function unassignedCards(presetId) {
    const ids = presetCards.filter(pc => pc.preset_id === presetId).map(pc => pc.card_id)
    return allCards.filter(c => !ids.includes(c.id))
  }

  async function addToPreset(presetId, cardId) {
    setAdding(cardId)
    const { data } = await supabase.from('preset_cards').insert({ preset_id: presetId, card_id: cardId, sort_order: Date.now() }).select()
    if (data?.[0]) setPresetCards(prev => [...prev, data[0]])
    setAdding(null)
  }

  async function removeFromPreset(presetId, cardId) {
    await supabase.from('preset_cards').delete().eq('preset_id', presetId).eq('card_id', cardId)
    setPresetCards(prev => prev.filter(pc => !(pc.preset_id === presetId && pc.card_id === cardId)))
  }

  if (loading) return <div className="text-slate-400 text-sm">Loading…</div>

  const activePreset = presets.find(p => p.id === openPreset)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Presets</h2>
        <p className="text-slate-500 text-sm mt-0.5">Manage which cards appear in each context</p>
      </div>

      {/* Preset tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => setOpenPreset(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
              ${openPreset === p.id ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}
          >
            <span>{p.icon}</span> {p.label}
          </button>
        ))}
      </div>

      {activePreset && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned cards */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">
              In "{activePreset.label}" <span className="text-slate-400 font-normal text-sm">({cardsForPreset(activePreset.id).length} cards)</span>
            </h3>
            <div className="divide-y divide-slate-50">
              {cardsForPreset(activePreset.id).map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{card.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                  </div>
                  <button
                    onClick={() => removeFromPreset(activePreset.id, card.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {cardsForPreset(activePreset.id).length === 0 && (
                <p className="text-slate-400 text-sm py-4 text-center">No cards assigned yet.</p>
              )}
            </div>
          </div>

          {/* Unassigned cards */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">
              Add to "{activePreset.label}"
            </h3>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {unassignedCards(activePreset.id).map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{card.emoji}</span>
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                  </div>
                  <button
                    onClick={() => addToPreset(activePreset.id, card.id)}
                    disabled={adding === card.id}
                    className="text-xs text-blue-500 hover:text-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {adding === card.id ? '…' : '+ Add'}
                  </button>
                </div>
              ))}
              {unassignedCards(activePreset.id).length === 0 && (
                <p className="text-slate-400 text-sm py-4 text-center">All cards are assigned.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
