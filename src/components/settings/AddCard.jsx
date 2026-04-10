import { useState } from 'react'
import { useStore } from '../../store/useStore'

const CATEGORIES = [
  { id: 'food',       label: 'Food',       emoji: '🍗' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛' },
  { id: 'people',     label: 'People',     emoji: '👥' },
]

const QUICK_EMOJIS = ['⭐','🌟','❤️','🎈','🎁','🏆','🌈','🦁','🐯','🐻','🦊','🐸','🍎','🍦','🍰','🎮','📱','🎸','⚽','🚀']

export default function AddCard({ onClose }) {
  const { addCard } = useStore()
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [category, setCategory] = useState('activities')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!label.trim()) return
    setSaving(true)
    await addCard({ label: label.trim(), emoji, category })
    setSaving(false)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="font-display text-xl text-txt">Add a Card</h3>

      {/* Emoji picker */}
      <div>
        <label className="font-body font-bold text-sm text-txt-m block mb-2">Emoji</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_EMOJIS.map(e => (
            <button
              key={e}
              onTouchStart={() => setEmoji(e)}
              onClick={() => setEmoji(e)}
              className={`text-2xl p-1.5 rounded-lg border-2 ${emoji === e ? 'border-act bg-act-l' : 'border-transparent'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="font-body font-bold text-sm text-txt-m block mb-2">Label</label>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Card name..."
          className="w-full bg-bg border border-bg2 rounded-btn px-3 py-2.5 font-body text-txt text-base outline-none focus:border-act"
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-body font-bold text-sm text-txt-m block mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onTouchStart={() => setCategory(cat.id)}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 p-3 rounded-btn border-2 text-left
                ${category === cat.id ? 'border-act bg-act-l' : 'border-bg2 bg-bg'}`}
            >
              <span>{cat.emoji}</span>
              <span className="font-body font-bold text-sm text-txt">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-bg rounded-btn p-4 flex items-center gap-4">
        <span className="text-5xl select-none">{emoji}</span>
        <span className="font-display text-lg text-txt">{label || 'Preview'}</span>
      </div>

      <button
        onTouchStart={handleSave}
        onClick={handleSave}
        disabled={!label.trim() || saving}
        className="w-full py-4 rounded-btn bg-act text-white font-display text-lg shadow-btn
                   disabled:opacity-50 active:scale-[0.97] transition-transform duration-150"
      >
        {saving ? 'Saving...' : 'Add Card'}
      </button>
    </div>
  )
}
