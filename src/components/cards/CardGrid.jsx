import PecsCard from './PecsCard'

export default function CardGrid({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 h-full">
      {cards.map(card => (
        <PecsCard key={card.id} card={card} />
      ))}
    </div>
  )
}
