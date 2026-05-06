// dashboard/src/components/safety/SafetyDeckManager.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SafetyDeckManager({ allCards }) {
  const [decks, setDecks]           = useState([])
  const [deckCards, setDeckCards]   = useState([])
  const [openDeck, setOpenDeck]     = useState(null)
  const [newDeckLabel, setNewLabel] = useState('')
  const [newDeckEmoji, setNewEmoji] = useState('📁')
  const [adding, setAdding]         = useState(false)

  async function loadDecks() {
    const [{ data: d }, { data: dc }] = await Promise.all([
      supabase.from('safety_decks').select('*').order('sort_order'),
      supabase.from('safety_deck_cards').select('*'),
    ])
    setDecks(d ?? [])
    setDeckCards(dc ?? [])
    if (!openDeck && d?.length) setOpenDeck(d[0].id)
  }

  useEffect(() => { loadDecks() }, [])

  async function createDeck(e) {
    e.preventDefault()
    if (!newDeckLabel.trim()) return
    const { data } = await supabase.from('safety_decks')
      .insert({ label: newDeckLabel.trim(), emoji: newDeckEmoji, sort_order: Date.now() })
      .select().single()
    if (data) { setDecks(prev => [...prev, data]); setOpenDeck(data.id) }
    setNewLabel('')
  }

  async function deleteDeck(id) {
    if (!confirm('Delete this theme? Cards are not deleted.')) return
    await supabase.from('safety_decks').delete().eq('id', id)
    setDecks(prev => prev.filter(d => d.id !== id))
    setDeckCards(prev => prev.filter(dc => dc.deck_id !== id))
    if (openDeck === id) setOpenDeck(decks.find(d => d.id !== id)?.id ?? null)
  }

  async function addToDeck(deckId, cardId) {
    setAdding(true)
    const { data } = await supabase.from('safety_deck_cards')
      .insert({ deck_id: deckId, card_id: cardId, sort_order: Date.now() }).select()
    if (data?.[0]) setDeckCards(prev => [...prev, data[0]])
    setAdding(false)
  }

  async function removeFromDeck(deckId, cardId) {
    await supabase.from('safety_deck_cards').delete().eq('deck_id', deckId).eq('card_id', cardId)
    setDeckCards(prev => prev.filter(dc => !(dc.deck_id === deckId && dc.card_id === cardId)))
  }

  const activeDeck = decks.find(d => d.id === openDeck)
  const inDeck = (deckId) => deckCards.filter(dc => dc.deck_id === deckId).map(dc => dc.card_id)
  const assignedIds = openDeck ? inDeck(openDeck) : []
  const assignedCards = allCards.filter(c => assignedIds.includes(c.id))
  const unassignedCards = allCards.filter(c => !assignedIds.includes(c.id))

  return (
    <div>
      {/* Create deck form */}
      <form onSubmit={createDeck} className="flex gap-3 mb-6">
        <input value={newDeckEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-14 border border-slate-200 rounded-xl text-center text-xl p-2 outline-none" />
        <input value={newDeckLabel} onChange={e => setNewLabel(e.target.value)} placeholder="New theme name…"
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400" />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition">Add</button>
      </form>

      {/* Deck tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {decks.map(d => (
          <button key={d.id} onClick={() => setOpenDeck(d.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
              ${openDeck === d.id ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
            {d.emoji} {d.label}
            <span className="text-xs opacity-70">({inDeck(d.id).length})</span>
          </button>
        ))}
      </div>

      {activeDeck && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* In deck */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">In "{activeDeck.label}"</h3>
              <button onClick={() => deleteDeck(activeDeck.id)} className="text-xs text-slate-400 hover:text-red-500 transition">Delete theme</button>
            </div>
            <div className="divide-y divide-slate-50">
              {assignedCards.map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {card.img_url
                      ? <img src={card.img_url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                      : <span className="text-lg">{card.emoji}</span>}
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                    <span className={`text-xs font-semibold ${card.is_safe ? 'text-green-600' : 'text-red-600'}`}>
                      {card.is_safe ? '✅' : '🚫'}
                    </span>
                  </div>
                  <button onClick={() => removeFromDeck(activeDeck.id, card.id)} className="text-xs text-slate-400 hover:text-red-500 transition font-medium">Remove</button>
                </div>
              ))}
              {assignedCards.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No cards yet.</p>}
            </div>
          </div>

          {/* Not in deck */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Add to "{activeDeck.label}"</h3>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {unassignedCards.map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {card.img_url
                      ? <img src={card.img_url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                      : <span className="text-lg">{card.emoji}</span>}
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                    <span className={`text-xs font-semibold ${card.is_safe ? 'text-green-600' : 'text-red-600'}`}>
                      {card.is_safe ? '✅' : '🚫'}
                    </span>
                  </div>
                  <button onClick={() => addToDeck(activeDeck.id, card.id)} disabled={adding}
                    className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition disabled:opacity-50">+ Add</button>
                </div>
              ))}
              {unassignedCards.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">All cards assigned.</p>}
            </div>
          </div>
        </div>
      )}
      {decks.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No themes yet. Create one above.</p>}
    </div>
  )
}
