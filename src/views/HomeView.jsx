import { useStore } from '../store/useStore'
import CardPager from '../components/cards/CardPager'

const CATEGORY_SHORTCUTS = [
  { id: 'food',       label: 'Food',     emoji: '🍗', color: 'bg-food-l text-food border-food-m' },
  { id: 'activities', label: 'Play',     emoji: '🎯', color: 'bg-act-l text-act border-act-m' },
  { id: 'feelings',   label: 'Feelings', emoji: '💛', color: 'bg-feel-l text-feel border-feel-m' },
  { id: 'people',     label: 'People',   emoji: '👥', color: 'bg-ppl-l text-ppl border-ppl-m' },
]

export default function HomeView() {
  const { cards, presets, presetCards, activePresetId, setActiveTab } = useStore()
  const activePreset = presets.find(p => p.id === activePresetId)
  const presetCardIds = activePresetId ? (presetCards[activePresetId] ?? []) : []

  const quickPicks = cards
    .filter(c => presetCardIds.includes(c.id))
    .sort((a, b) => presetCardIds.indexOf(a.id) - presetCardIds.indexOf(b.id))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-1 pb-2 flex-shrink-0">
        <p className="font-body font-bold text-[13px] text-txt-m uppercase tracking-wide">
          {activePreset?.icon} {activePreset?.label ?? 'Quick Picks'}
        </p>
      </div>

      <CardPager cards={quickPicks} />

      {/* Category shortcut row */}
      <div className="px-3 pb-3 pt-1 flex gap-2 flex-shrink-0">
        {CATEGORY_SHORTCUTS.map(cat => (
          <button
            key={cat.id}
            onTouchStart={() => setActiveTab(cat.id)}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-btn border ${cat.color} text-xs font-body font-bold`}
          >
            <span className="text-xl">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
