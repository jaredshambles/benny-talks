import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { speak } from '../../lib/speech'

export default function TimerDoneOverlay() {
  const { timerDoneVisible, dismissTimerDone, settings } = useStore()

  useEffect(() => {
    if (timerDoneVisible) {
      speak("Time's up! Great waiting!", { rate: settings.voiceRate, pitch: settings.voicePitch })
    }
  }, [timerDoneVisible])

  return (
    <AnimatePresence>
      {timerDoneVisible && (
        <motion.div
          key="timer-done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="absolute inset-0 bg-[#FDF6EE]/95 z-50 flex flex-col items-center justify-center gap-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="text-center">
            <p className="font-display text-3xl text-txt">Time's up!</p>
            <p className="font-body text-lg text-txt-m mt-1">Great waiting!</p>
          </div>
          <button
            onTouchStart={dismissTimerDone}
            onClick={dismissTimerDone}
            className="bg-act text-white font-display text-xl rounded-pill px-10 py-4 shadow-btn active:opacity-80"
          >
            🎉 Yay!
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
