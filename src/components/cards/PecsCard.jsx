import { useState } from 'react'
import { useStore } from '../../store/useStore'

const CATEGORY_STYLES = {
  food:       { bar: 'bg-food',  bloom: 'bg-food-l'  },
  activities: { bar: 'bg-act',   bloom: 'bg-act-l'   },
  feelings:   { bar: 'bg-feel',  bloom: 'bg-feel-l'  },
  people:     { bar: 'bg-ppl',   bloom: 'bg-ppl-l'   },
  routines:   { bar: 'bg-rtn',   bloom: 'bg-rtn-l'   },
  custom:     { bar: 'bg-cust',  bloom: 'bg-cust-l'  },
}

export default function PecsCard({ card }) {
  const { tapCard, speaking } = useStore()
  const [pressing, setPressing] = useState(false)
  const [blooming, setBlooming] = useState(false)

  const styles = CATEGORY_STYLES[card.category] ?? CATEGORY_STYLES.custom
  const isActive = speaking?.label === card.label

  // Visual feedback fires immediately on touch so the card feels instant
  function handleTouchStart() {
    setPressing(true)
    setBlooming(true)
    setTimeout(() => setPressing(false), 150)
    setTimeout(() => setBlooming(false), 400)
  }

  // Audio fires on click — iOS treats this as a trusted user gesture for speech synthesis.
  // A single tap on iOS produces one click event, so there is no double-fire concern here.
  function handleClick() {
    tapCard(card)
  }

  return (
    <button
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-card bg-card shadow-card border-none
        flex flex-col items-center justify-center gap-2 p-3
        transition-transform duration-150 w-full h-full touch-manipulation
        ${pressing ? 'scale-[0.93]' : 'scale-100'}
        ${isActive ? 'ring-2 ring-offset-1 ring-txt-m' : ''}
        min-h-[80px]
      `}
    >
      {/* Category bar */}
      <div className={`absolute top-0 inset-x-0 h-1 ${styles.bar}`} />

      {/* Bloom overlay */}
      <div className={`absolute inset-0 rounded-card transition-opacity duration-300 ${styles.bloom} ${blooming ? 'opacity-100' : 'opacity-0'}`} />

      {/* Content */}
      {card.img_url
        ? <img
            src={card.img_url}
            alt={card.label}
            className="relative w-full aspect-square object-cover rounded-xl select-none"
            draggable={false}
          />
        : <span className="relative text-[52px] leading-none select-none">{card.emoji}</span>
      }
      <span className="relative font-display text-sm text-center text-txt leading-tight px-1 line-clamp-2 select-none">
        {card.label}
      </span>
    </button>
  )
}
