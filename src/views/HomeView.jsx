import { useStore } from '../store/useStore'
import CardPager from '../components/cards/CardPager'

export default function HomeView() {
  const { cards, presets, presetCards, activePresetId } = useStore()
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

      <CardPager key={activePresetId} cards={quickPicks} />
    </div>
  )
}
