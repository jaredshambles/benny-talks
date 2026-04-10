import { useStore } from '../../store/useStore'
import { playTransitionChime } from '../../lib/sounds'
import { speak } from '../../lib/speech'
import TimerPill from '../overlay/TimerPill'

export default function Header() {
  const {
    presets, activePresetId, timer,
    openPresetSwitcher, openSettings, openTimerPicker,
    settings, showTransitionOverlay,
  } = useStore()
  const activePreset = presets.find(p => p.id === activePresetId)

  function handleChime() {
    if (settings.transitionChimeEnabled) {
      playTransitionChime()
      speak('Time to switch!', { rate: settings.voiceRate, pitch: settings.voicePitch })
      showTransitionOverlay()
    }
  }

  return (
    <header
      className="flex items-center gap-2 bg-bg px-4 pb-2.5 flex-shrink-0"
      style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
    >
      {/* Left: logo + preset pill stacked */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Logo row */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-btn bg-gradient-to-br from-[#FFD166] to-[#F4A261] flex items-center justify-center text-lg shadow-[0_3px_10px_rgba(244,162,97,0.4)] flex-shrink-0">
            🗣️
          </div>
          <span className="font-display text-[22px] text-txt">
            Benny <span className="text-act">Talks</span>
          </span>
        </div>
        {/* Preset pill */}
        <button
          onTouchStart={openPresetSwitcher}
          onClick={openPresetSwitcher}
          className="flex items-center gap-1 bg-card rounded-pill px-3 py-1 shadow-btn self-start"
        >
          <span className="text-sm">{activePreset?.icon ?? '⭐'}</span>
          <span className="font-body font-bold text-xs text-txt">{activePreset?.label ?? 'All Cards'}</span>
          <span className="text-txt-l text-xs ml-0.5">›</span>
        </button>
      </div>

      {/* Center: timer pill when running */}
      {timer.running && (
        <div className="flex justify-center px-1">
          <TimerPill />
        </div>
      )}

      {/* Right: action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onTouchStart={handleChime}
          onClick={handleChime}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg"
          aria-label="Transition chime"
        >
          🔔
        </button>
        <button
          onTouchStart={openTimerPicker}
          onClick={openTimerPicker}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg"
          aria-label="Set timer"
        >
          ⏱️
        </button>
        <button
          onTouchStart={openSettings}
          onClick={openSettings}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-base"
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>
    </header>
  )
}
