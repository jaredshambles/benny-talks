import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import AddCard from './AddCard'

export default function SettingsModal() {
  const { settingsOpen, closeSettings, settings, updateSettings } = useStore()
  const [view, setView] = useState('main')

  function handleClose() {
    setView('main')
    closeSettings()
  }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute inset-0 bg-bg z-50 flex flex-col overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Header — always visible, X to close */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-bg2"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
          >
            <h2 className="font-display text-xl text-txt">
              {view === 'addCard' ? 'Add a Card' : 'Settings'}
            </h2>
            <button
              onTouchStart={view === 'addCard' ? () => setView('main') : handleClose}
              onClick={view === 'addCard' ? () => setView('main') : handleClose}
              className="w-9 h-9 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-bold"
            >
              {view === 'addCard' ? '←' : '✕'}
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'main' && (
              <div className="flex flex-col gap-1 p-4">
                {/* Cards section */}
                <SectionLabel>Cards</SectionLabel>
                <SettingsRow icon="➕" label="Add a Card" onPress={() => setView('addCard')} />

                {/* Voice section */}
                <SectionLabel>Voice</SectionLabel>
                <div className="bg-card rounded-btn p-4 flex flex-col gap-4">
                  <SliderRow
                    label="Speed"
                    value={settings.voiceRate}
                    min={0.5} max={1.2} step={0.05}
                    onChange={v => updateSettings({ voiceRate: v })}
                  />
                  <SliderRow
                    label="Pitch"
                    value={settings.voicePitch}
                    min={0.8} max={1.5} step={0.05}
                    onChange={v => updateSettings({ voicePitch: v })}
                  />
                </div>

                {/* Sound section */}
                <SectionLabel>Sound</SectionLabel>
                <div className="bg-card rounded-btn p-4 flex items-center justify-between">
                  <span className="font-body font-bold text-sm text-txt">Transition Chime</span>
                  <Toggle
                    on={settings.transitionChimeEnabled}
                    onToggle={() => updateSettings({ transitionChimeEnabled: !settings.transitionChimeEnabled })}
                  />
                </div>

                {/* Version */}
                <p className="text-center font-body text-xs text-txt-l pt-6 pb-2">Benny Talks v1.0.0</p>
              </div>
            )}
            {view === 'addCard' && <AddCard onClose={() => setView('main')} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider px-2 pb-1 pt-4 first:pt-2">
      {children}
    </p>
  )
}

function SettingsRow({ icon, label, onPress }) {
  return (
    <button
      onTouchStart={onPress}
      onClick={onPress}
      className="bg-card rounded-btn p-4 flex items-center gap-3 w-full text-left active:bg-bg2 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-body font-bold text-sm text-txt flex-1">{label}</span>
      <span className="text-txt-l text-sm">›</span>
    </button>
  )
}

function SliderRow({ label, value, min, max, step, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-body font-bold text-sm text-txt w-12">{label}</span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1"
      />
      <span className="font-body text-xs text-txt-m w-8 text-right">{value.toFixed(2)}</span>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onTouchStart={onToggle}
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-food' : 'bg-bg2'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200
        ${on ? 'left-[26px]' : 'left-0.5'}`}
      />
    </button>
  )
}
