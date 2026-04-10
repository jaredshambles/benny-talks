import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function PresetSwitcher() {
  const { presets, activePresetId, presetSwitcherOpen, setActivePreset, closePresetSwitcher } = useStore()

  return (
    <AnimatePresence>
      {presetSwitcherOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 z-40"
            onTouchStart={closePresetSwitcher}
            onClick={closePresetSwitcher}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="absolute bottom-0 inset-x-0 bg-card rounded-t-[24px] z-50 shadow-modal"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="font-display text-xl text-txt">Switch Mode</h3>
              <button
                onTouchStart={closePresetSwitcher}
                onClick={closePresetSwitcher}
                className="w-8 h-8 rounded-full bg-bg2 flex items-center justify-center text-txt-m text-sm font-body font-bold"
              >
                ✕
              </button>
            </div>
            <div className="px-4 pb-4 grid grid-cols-2 gap-3">
              {presets.map(preset => {
                const isActive = preset.id === activePresetId
                return (
                  <button
                    key={preset.id}
                    onTouchStart={() => setActivePreset(preset.id)}
                    onClick={() => setActivePreset(preset.id)}
                    className={`flex items-center gap-3 p-4 rounded-btn border-2 text-left
                      ${isActive ? 'border-act bg-act-l' : 'border-bg2 bg-bg'}`}
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <span className={`font-body font-bold text-sm ${isActive ? 'text-act' : 'text-txt'}`}>
                      {preset.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
