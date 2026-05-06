// src/components/games/GamePickerModal.jsx
export default function GamePickerModal({ onSelect }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[24px] shadow-modal px-4 pt-5 pb-8"
         style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

      <div className="w-10 h-1 bg-bg2 rounded-full mx-auto mb-5" />

      <h2 className="font-display text-xl text-txt text-center mb-5">
        What do you want to play?
      </h2>

      {/* Safe or Not Safe */}
      <button
        onTouchStart={() => onSelect('safety')}
        onClick={() => onSelect('safety')}
        className="w-full flex items-center gap-4 p-4 rounded-card bg-bg border-2 border-ppl
                   active:scale-[0.97] transition-transform duration-150 mb-3"
      >
        <span className="text-4xl">🛡️</span>
        <div className="text-left">
          <p className="font-display text-lg text-txt">Safe or Not Safe</p>
          <p className="font-body text-sm text-txt-m">Learn what keeps you safe</p>
        </div>
      </button>

      {/* Future games placeholder */}
      <div className="w-full flex items-center gap-4 p-4 rounded-card bg-bg opacity-40 cursor-default">
        <span className="text-4xl">🎮</span>
        <p className="font-body text-sm text-txt-m">More games coming soon…</p>
      </div>
    </div>
  )
}
