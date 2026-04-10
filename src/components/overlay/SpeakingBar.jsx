import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function SpeakingBar() {
  const { speaking } = useStore()

  return (
    <AnimatePresence>
      {speaking && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-[72px] inset-x-0 mx-3 mb-1 bg-card rounded-card shadow-modal
                     flex items-center gap-3 px-4 py-3 z-50 border border-bg2"
          style={{ bottom: 'calc(72px + env(safe-area-inset-bottom) + 4px)' }}
        >
          <span className="text-4xl select-none">{speaking.emoji}</span>
          <span className="font-display text-2xl text-txt flex-1 select-none">{speaking.label}</span>
          {/* Animated wave dots */}
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-txt-m"
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
