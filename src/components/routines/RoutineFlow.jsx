import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import RoutineStep from './RoutineStep'

export default function RoutineFlow() {
  const { routineActive, routineStepIndex, routineSteps, nextStep, closeRoutine } = useStore()
  if (!routineActive) return null

  const steps = routineSteps[routineActive.id] ?? []
  const currentStep = steps[routineStepIndex]
  const isLast = routineStepIndex >= steps.length - 1

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-0 bg-bg z-50 flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{routineActive.emoji}</span>
          <span className="font-display text-xl text-txt">{routineActive.label}</span>
        </div>
        <button
          onTouchStart={closeRoutine}
          onClick={closeRoutine}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg text-txt-m font-body font-bold"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg2 mx-4 rounded-full flex-shrink-0">
        <div
          className="h-full bg-rtn rounded-full transition-all duration-300"
          style={{ width: `${((routineStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step — animated on step change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={routineStepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {currentStep && (
            <RoutineStep
              step={currentStep}
              stepIndex={routineStepIndex}
              totalSteps={steps.length}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next / Done button */}
      <div className="px-6 pb-4 flex-shrink-0">
        <button
          onTouchStart={nextStep}
          onClick={nextStep}
          className="w-full py-4 rounded-btn bg-rtn text-white font-display text-xl shadow-modal
                     active:scale-[0.97] transition-transform duration-150"
        >
          {isLast ? '🎉 All Done!' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}
