import PecsCard from './PecsCard'

export default function CardGrid({ cards }) {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full">
      {cards.map(card => (
        <PecsCard key={card.id} card={card} />
      ))}
    </div>
  )
}
