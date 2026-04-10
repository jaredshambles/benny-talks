import { useStore } from '../../store/useStore'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

export default function TimerPill() {
  const { timer, pauseTimer } = useStore()
  if (!timer.running) return null

  const pct = timer.totalSecs > 0 ? timer.remainingSecs / timer.totalSecs : 0
  const colorClass = pct > 0.4 ? 'border-transparent text-txt'
    : pct > 0.2 ? 'border-act text-act'
    : 'border-feel text-feel animate-pulse'

  return (
    <button
      onTouchStart={pauseTimer}
      onClick={pauseTimer}
      className={`flex items-center gap-1.5 bg-card rounded-pill px-3 py-1.5 shadow-btn border-2 ${colorClass}`}
    >
      <span className="text-sm">{timer.paused ? '⏸️' : '⏱️'}</span>
      <span className="font-display text-lg min-w-[44px] text-center">
        {formatTime(timer.remainingSecs)}
      </span>
    </button>
  )
}
