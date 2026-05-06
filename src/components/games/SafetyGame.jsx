// src/components/games/SafetyGame.jsx
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { speak } from '../../lib/speech'
import { useStore } from '../../store/useStore'
import SafetyCard from './SafetyCard'
import FeedbackOverlay from './FeedbackOverlay'
import GameComplete from './GameComplete'

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// phase: 'loading' | 'question' | 'feedback' | 'complete'
export default function SafetyGame({ mode, deckId, onDone }) {
  const { settings } = useStore()
  const [cards, setCards]         = useState([])
  const [index, setIndex]         = useState(0)
  const [phase, setPhase]         = useState('loading')
  const [lastCorrect, setCorrect] = useState(null)
  const timerRef                  = useRef(null)

  // Fetch cards on mount
  useEffect(() => {
    async function load() {
      let data
      if (mode === 'shuffle') {
        const res = await supabase.from('safety_cards').select('*').order('sort_order')
        data = res.data ?? []
      } else {
        // theme mode — join through safety_deck_cards
        const res = await supabase
          .from('safety_deck_cards')
          .select('safety_cards(*)')
          .eq('deck_id', deckId)
          .order('sort_order')
        data = (res.data ?? []).map(r => r.safety_cards)
      }
      setCards(shuffle(data))
      setPhase('question')
    }
    load()
  }, [mode, deckId])

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const card = cards[index]

  function handleAnswer(answer) {
    if (phase !== 'question' || !card) return

    // Speak the card label immediately
    speak(card.label, { rate: settings.voiceRate, pitch: settings.voicePitch })

    const isCorrect = answer === (card.is_safe ? 'safe' : 'unsafe')
    setCorrect(isCorrect)
    setPhase('feedback')

    // Speak the reinforcement phrase after a short pause (fire-and-forget)
    const reinforcement = `${card.label} is ${card.is_safe ? 'safe' : 'not safe'}`
    setTimeout(() => {
      speak(reinforcement, { rate: settings.voiceRate, pitch: settings.voicePitch })
    }, 400)

    // Auto-advance — store in ref so we can cancel on unmount
    const delay = isCorrect ? 1800 : 2200
    timerRef.current = setTimeout(() => advance(index, cards), delay)
  }

  function advance(currentIndex, currentCards) {
    if (currentIndex + 1 >= currentCards.length) {
      setPhase('complete')
    } else {
      setIndex(currentIndex + 1)
      setPhase('question')
    }
    setCorrect(null)
  }

  function handlePlayAgain() {
    setCards(c => shuffle(c))
    setIndex(0)
    setPhase('question')
    setCorrect(null)
  }

  if (phase === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg">
        <p className="font-body text-txt-m">Loading…</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-bg"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
           style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <p className="font-display text-lg text-txt-m">Safe or Not Safe?</p>
        <button
          onTouchStart={onDone}
          onClick={onDone}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg text-txt-m font-body font-bold"
        >
          ✕
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-4 mb-6 flex-shrink-0 flex-wrap">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < index ? 'bg-food w-5'
              : i === index ? 'bg-food w-5 opacity-60'
              : 'bg-bg2 w-2'
            }`}
          />
        ))}
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center">
        {card && (
          <SafetyCard
            card={card}
            onAnswer={handleAnswer}
            disabled={phase !== 'question'}
          />
        )}
      </div>

      {/* Prompt */}
      <p className="text-center font-body text-txt-l text-sm pb-6 flex-shrink-0">
        Is this safe or not safe?
      </p>

      {/* Feedback overlay */}
      <AnimatePresence>
        {phase === 'feedback' && card && (
          <FeedbackOverlay key="feedback" correct={lastCorrect} card={card} />
        )}
      </AnimatePresence>

      {/* Complete screen */}
      <AnimatePresence>
        {phase === 'complete' && (
          <GameComplete key="complete" onPlayAgain={handlePlayAgain} onDone={onDone} />
        )}
      </AnimatePresence>
    </div>
  )
}
