// src/components/games/ModePickerModal.jsx
export default function ModePickerModal({ onSelect, onBack }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[24px] shadow-modal px-4 pt-5 pb-8"
         style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

      <button
        onTouchStart={onBack}
        onClick={onBack}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-txt-l font-body font-bold text-lg"
      >
        ✕
      </button>

      <div className="w-10 h-1 bg-bg2 rounded-full mx-auto mb-5" />

      <div className="flex flex-col items-center mb-6">
        <span className="text-4xl mb-2">🛡️</span>
        <h2 className="font-display text-xl text-txt">How do you want to play?</h2>
      </div>

      <button
        onTouchStart={() => onSelect('shuffle')}
        onClick={() => onSelect('shuffle')}
        className="w-full flex items-center gap-4 p-4 rounded-card bg-ppl-l border-2 border-ppl
                   active:scale-[0.97] transition-transform duration-150 mb-3"
      >
        <span className="text-3xl">🔀</span>
        <div className="text-left">
          <p className="font-display text-lg text-txt">Shuffle All</p>
          <p className="font-body text-sm text-txt-m">All cards, random order</p>
        </div>
      </button>

      <button
        onTouchStart={() => onSelect('theme')}
        onClick={() => onSelect('theme')}
        className="w-full flex items-center gap-4 p-4 rounded-card bg-act-l border-2 border-act
                   active:scale-[0.97] transition-transform duration-150"
      >
        <span className="text-3xl">📁</span>
        <div className="text-left">
          <p className="font-display text-lg text-txt">Pick a Theme</p>
          <p className="font-body text-sm text-txt-m">Kitchen, Strangers, Outside…</p>
        </div>
      </button>
    </div>
  )
}
