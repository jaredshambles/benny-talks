import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

const PRESETS = [
  { label: '30s', secs: 30 },
  { label: '1 min', secs: 60 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
]

export default function TimerPicker() {
  const { timerPickerOpen, closeTimerPicker, startTimer, cancelTimer } = useStore()

  function handlePick(secs) {
    startTimer(secs)
    closeTimerPicker()
  }

  function handleCancel() {
    cancelTimer()
    closeTimerPicker()
  }

  return (
    <AnimatePresence>
      {timerPickerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="timer-picker-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 z-40"
            onTouchStart={handleCancel}
            onClick={handleCancel}
          />
          {/* Sheet */}
          <motion.div
            key="timer-picker-sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 bg-bg rounded-t-[24px] z-50 p-6"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-txt">Set a Timer</h2>
              <button
                onTouchStart={handleCancel}
                onClick={handleCancel}
                className="w-8 h-8 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map(({ label, secs }) => (
                <button
                  key={secs}
                  onTouchStart={() => handlePick(secs)}
                  onClick={() => handlePick(secs)}
                  className="bg-card rounded-btn py-4 flex flex-col items-center justify-center shadow-btn active:bg-bg2 transition-colors"
                >
                  <span className="font-display text-2xl text-act">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
