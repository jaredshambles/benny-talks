// src/components/games/FeedbackOverlay.jsx
import { motion } from 'framer-motion'

// correct: true → green, false → orange
// card: the safety_card object
export default function FeedbackOverlay({ correct, card }) {
  const bg = correct
    ? 'from-food to-[#16a34a]'        // green gradient
    : 'from-act to-[#ea580c]'         // warm orange gradient

  const emoji   = correct ? '🎉' : '🤔'
  const heading = correct ? "That's right!" : "Let's try again!"
  const answer  = card.is_safe ? 'safe' : 'not safe'
  const detail  = `${card.label} is ${answer}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-5
                  bg-gradient-to-br ${bg}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="text-[80px] leading-none">{emoji}</span>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-3xl text-white">{heading}</p>
        <p className="font-body text-white text-lg opacity-90">{detail}</p>
      </div>
    </motion.div>
  )
}
