import { useStore } from '../../store/useStore'
import { playTransitionChime } from '../../lib/sounds'
import TimerPill from '../overlay/TimerPill'

export default function Header() {
  const { presets, activePresetId, timer, openPresetSwitcher, openSettings, settings } = useStore()
  const activePreset = presets.find(p => p.id === activePresetId)

  function handleChime() {
    if (settings.transitionChimeEnabled) playTransitionChime()
  }

  return (
    <header
      className="flex items-center justify-between gap-2 bg-bg px-4 pb-2.5 flex-shrink-0"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      {/* Logo + wordmark */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-btn bg-gradient-to-br from-[#FFD166] to-[#F4A261] flex items-center justify-center text-lg shadow-[0_3px_10px_rgba(244,162,97,0.4)]">
          🗣️
        </div>
        <span className="font-display text-[22px] text-txt">
          Benny <span className="text-act">Talks</span>
        </span>
      </div>

      {/* Center: timer pill or preset switcher */}
      <div className="flex-1 flex justify-center">
        {timer.running ? (
          <TimerPill />
        ) : (
          <button
            onTouchStart={openPresetSwitcher}
            onClick={openPresetSwitcher}
            className="flex items-center gap-1 bg-card rounded-pill px-3 py-1.5 shadow-btn"
          >
            <span className="text-base">{activePreset?.icon ?? '⭐'}</span>
            <span className="font-body font-bold text-sm text-txt">{activePreset?.label ?? 'All Cards'}</span>
            <span className="text-txt-l text-xs ml-0.5">›</span>
          </button>
        )}
      </div>

      {/* Right: chime + settings */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onTouchStart={handleChime}
          onClick={handleChime}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg"
        >
          🔔
        </button>
        <button
          onTouchStart={openSettings}
          onClick={openSettings}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-base"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
