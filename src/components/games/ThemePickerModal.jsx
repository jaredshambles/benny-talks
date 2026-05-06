// src/components/games/ThemePickerModal.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ThemePickerModal({ onSelect, onBack }) {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('safety_decks')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setDecks(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[24px] shadow-modal px-4 pt-5 pb-8"
         style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

      <button
        onTouchStart={onBack}
        onClick={onBack}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-txt-l font-body font-bold text-lg"
      >
        ✕
      </button>

      <div className="w-10 h-1 bg-bg2 rounded-full mx-auto mb-5" />
      <h2 className="font-display text-xl text-txt text-center mb-5">Pick a Theme</h2>

      {loading && <p className="text-center text-txt-m font-body">Loading…</p>}

      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
        {decks.map(deck => (
          <button
            key={deck.id}
            onTouchStart={() => onSelect(deck.id)}
            onClick={() => onSelect(deck.id)}
            className="w-full flex items-center gap-4 p-4 rounded-card bg-bg border-2 border-bg2
                       active:scale-[0.97] transition-transform duration-150"
          >
            <span className="text-3xl">{deck.emoji}</span>
            <p className="font-display text-lg text-txt">{deck.label}</p>
          </button>
        ))}
        {!loading && decks.length === 0 && (
          <p className="text-center text-txt-m font-body text-sm">No themes yet — add some in the dashboard.</p>
        )}
      </div>
    </div>
  )
}
