// src/components/games/GameComplete.jsx
import { motion } from 'framer-motion'

export default function GameComplete({ onPlayAgain, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="text-[90px] leading-none">🏆</span>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-3xl text-txt">All done, Benny!</p>
        <p className="font-body text-txt-m text-base">Great job!</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <button
          onTouchStart={onPlayAgain}
          onClick={onPlayAgain}
          className="w-full py-4 rounded-btn bg-ppl text-white font-display text-xl
                     shadow-btn active:scale-[0.97] transition-transform duration-150"
        >
          Play Again
        </button>
        <button
          onTouchStart={onDone}
          onClick={onDone}
          className="w-full py-4 rounded-btn bg-bg2 text-txt font-display text-xl
                     shadow-btn active:scale-[0.97] transition-transform duration-150"
        >
          Done
        </button>
      </div>
    </motion.div>
  )
}
