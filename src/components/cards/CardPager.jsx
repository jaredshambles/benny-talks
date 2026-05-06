import { useState } from 'react'
import CardGrid from './CardGrid'

const CARDS_PER_PAGE = 6

export default function CardPager({ cards }) {
  const [page, setPage] = useState(0)

  const pages = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE))
  }
  const totalPages = pages.length
  const hasPrev = page > 0
  const hasNext = page < totalPages - 1

  if (!cards.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-txt-l font-body text-sm">
        No cards here yet
      </div>
    )
  }

  return (
    <div className="flex flex-row flex-1 overflow-hidden px-1 gap-1">
      {/* Left arrow */}
      <button
        onTouchStart={(e) => { e.preventDefault(); if (hasPrev) setPage(p => p - 1) }}
        onClick={() => { if (hasPrev) setPage(p => p - 1) }}
        className={`flex-shrink-0 w-9 flex items-center justify-center rounded-xl transition-opacity duration-150 select-none
          ${hasPrev ? 'opacity-100 text-txt-m' : 'opacity-0 pointer-events-none'}`}
        aria-label="Previous page"
      >
        <span className="text-3xl font-light leading-none">‹</span>
      </button>

      {/* Card grid */}
      <div className="flex-1 overflow-hidden relative">
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

      {/* Right arrow */}
      <button
        onTouchStart={(e) => { e.preventDefault(); if (hasNext) setPage(p => p + 1) }}
        onClick={() => { if (hasNext) setPage(p => p + 1) }}
        className={`flex-shrink-0 w-9 flex items-center justify-center rounded-xl transition-opacity duration-150 select-none
          ${hasNext ? 'opacity-100 text-txt-m' : 'opacity-0 pointer-events-none'}`}
        aria-label="Next page"
      >
        <span className="text-3xl font-light leading-none">›</span>
      </button>
    </div>
  )
}
