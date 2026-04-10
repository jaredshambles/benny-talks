import { useState, useRef } from 'react'
import CardGrid from './CardGrid'

const CARDS_PER_PAGE = 6

export default function CardPager({ cards }) {
  const [page, setPage] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const pages = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE))
  }
  const totalPages = pages.length

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && page < totalPages - 1) setPage(p => p + 1)
      if (dx > 0 && page > 0) setPage(p => p - 1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (!cards.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-txt-l font-body text-sm">
        No cards here yet
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-3">
      <div
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: `translateX(${-page * 100}%)`, width: `${totalPages * 100}%` }}
        >
          {pages.map((pageCards, i) => (
            <div key={i} className="h-full p-1" style={{ width: `${100 / totalPages}%` }}>
              <CardGrid cards={pageCards} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 py-2 flex-shrink-0">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 bg-txt-l
                ${i === page ? 'w-4 bg-txt-m' : 'w-1.5'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
