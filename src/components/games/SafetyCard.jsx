// src/components/games/SafetyCard.jsx
import { useState } from 'react'

export default function SafetyCard({ card, onAnswer, disabled }) {
  const [pressing, setPressing] = useState(null) // 'safe' | 'unsafe' | null

  function handleTap(answer) {
    if (disabled) return
    setPressing(answer)
    setTimeout(() => setPressing(null), 150)
    onAnswer(answer)
  }

  return (
    <div className="flex items-center gap-3 w-full px-4">

      {/* Safe zone — left */}
      <button
        onTouchStart={() => handleTap('safe')}
        onClick={() => handleTap('safe')}
        disabled={disabled}
        className={`w-14 flex-shrink-0 bg-food-l border-2 border-food rounded-[20px]
                    flex flex-col items-center justify-center py-5 gap-1.5
                    transition-transform duration-150 disabled:opacity-60
                    ${pressing === 'safe' ? 'scale-90' : 'scale-100'}`}
      >
        <span className="text-2xl leading-none">✅</span>
        <span className="font-body font-bold text-[9px] text-food uppercase tracking-wide">Safe</span>
      </button>

      {/* Card — center */}
      <div className="flex-1 bg-card rounded-card shadow-card flex flex-col items-center justify-center gap-3 py-8">
        {card.img_url
          ? <img src={card.img_url} alt={card.label}
                 className="w-20 h-20 object-cover rounded-xl select-none" draggable={false} />
          : <span className="text-[72px] leading-none select-none">{card.emoji}</span>
        }
        <span className="font-display text-xl text-txt text-center px-2 leading-tight select-none">
          {card.label}
        </span>
      </div>

      {/* Not Safe zone — right */}
      <button
        onTouchStart={() => handleTap('unsafe')}
        onClick={() => handleTap('unsafe')}
        disabled={disabled}
        className={`w-14 flex-shrink-0 bg-feel-l border-2 border-feel rounded-[20px]
                    flex flex-col items-center justify-center py-5 gap-1.5
                    transition-transform duration-150 disabled:opacity-60
                    ${pressing === 'unsafe' ? 'scale-90' : 'scale-100'}`}
      >
        <span className="text-2xl leading-none">🚫</span>
        <span className="font-body font-bold text-[9px] text-feel uppercase tracking-wide leading-tight text-center">Not Safe</span>
      </button>

    </div>
  )
}
