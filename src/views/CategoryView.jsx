import { useStore } from '../store/useStore'
import CardPager from '../components/cards/CardPager'

const CATEGORY_LABELS = {
  food: 'Food',
  activities: 'Activities',
  feelings: 'Feelings',
  people: 'People',
}

export default function CategoryView({ category }) {
  const { cards, presetCards, activePresetId } = useStore()

  const presetCardIds = activePresetId ? (presetCards[activePresetId] ?? []) : null
  const visible = cards.filter(c =>
    c.category === category &&
    (presetCardIds === null || presetCardIds.includes(c.id))
  ).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 flex-shrink-0">
        <h2 className="font-display text-[17px] text-txt-m">{CATEGORY_LABELS[category]}</h2>
      </div>
      <CardPager cards={visible} />
    </div>
  )
}
