import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function TransitionOverlay() {
  const { transitionOverlayVisible, dismissTransitionOverlay } = useStore()

  return (
    <AnimatePresence>
      {transitionOverlayVisible && (
        <motion.div
          key="transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-act/20 z-50 flex flex-col items-center justify-center gap-6 px-8"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-7xl"
          >
            🔔
          </motion.div>
          <div className="bg-white rounded-card shadow-modal p-6 w-full max-w-sm text-center">
            <p className="font-display text-2xl text-act">Time to switch!</p>
            <p className="font-body text-base text-txt-m mt-2">Let's try something new</p>
            <button
              onTouchStart={dismissTransitionOverlay}
              onClick={dismissTransitionOverlay}
              className="mt-5 bg-act text-white font-display text-lg rounded-pill px-8 py-3 shadow-btn active:opacity-80 w-full"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
