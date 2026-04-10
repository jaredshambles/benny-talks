import { useEffect } from 'react'
import { useStore } from '../../store/useStore'

export default function RoutineStep({ step, stepIndex, totalSteps }) {
  const { startTimer, timer } = useStore()

  useEffect(() => {
    if (step.timer_secs) startTimer(step.timer_secs, step.label)
  }, [stepIndex])

  const pct = timer.totalSecs > 0 ? timer.remainingSecs / timer.totalSecs : 0

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center flex-1">
      {/* Step counter */}
      <p className="font-body font-bold text-txt-l text-sm">
        Step {stepIndex + 1} of {totalSteps}
      </p>

      {/* Emoji */}
      <div className="w-32 h-32 rounded-full bg-rtn-l flex items-center justify-center text-[80px]">
        {step.emoji}
      </div>

      {/* Label */}
      <div>
        <p className="font-display text-3xl text-txt leading-tight">{step.label}</p>
        {step.sub_label && (
          <p className="font-body font-semibold text-txt-m text-base mt-1">{step.sub_label}</p>
        )}
      </div>

      {/* Timer display if running */}
      {timer.running && (
        <div className={`font-display text-5xl transition-colors
          ${pct > 0.5 ? 'text-food' : pct > 0.2 ? 'text-act' : 'text-feel animate-pulse'}`}
        >
          {Math.floor(timer.remainingSecs / 60) > 0
            ? `${Math.floor(timer.remainingSecs / 60)}:${String(timer.remainingSecs % 60).padStart(2, '0')}`
            : `${timer.remainingSecs}s`}
        </div>
      )}
    </div>
  )
}
