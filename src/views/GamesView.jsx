// src/views/GamesView.jsx
import { useState } from 'react'
import GamePickerModal from '../components/games/GamePickerModal'
import ModePickerModal from '../components/games/ModePickerModal'
import ThemePickerModal from '../components/games/ThemePickerModal'
import SafetyGame from '../components/games/SafetyGame'

// screen: 'picker' | 'mode' | 'theme' | 'playing'
export default function GamesView() {
  const [screen, setScreen] = useState('picker')
  const [mode, setMode] = useState(null)    // 'shuffle' | 'theme'
  const [deckId, setDeckId] = useState(null)

  function handleSelectGame(gameId) {
    if (gameId === 'safety') setScreen('mode')
  }

  function handleSelectMode(selectedMode) {
    setMode(selectedMode)
    if (selectedMode === 'shuffle') setScreen('playing')
    else setScreen('theme')
  }

  function handleSelectDeck(id) {
    setDeckId(id)
    setScreen('playing')
  }

  function handleGameEnd() {
    setScreen('picker')
    setMode(null)
    setDeckId(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg relative">
      {screen === 'picker' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 pb-8">
          <span className="text-6xl">🎮</span>
          <p className="font-display text-xl text-txt-m">Games</p>
        </div>
      )}

      {screen === 'picker' && (
        <GamePickerModal onSelect={handleSelectGame} />
      )}

      {screen === 'mode' && (
        <ModePickerModal onSelect={handleSelectMode} onBack={() => setScreen('picker')} />
      )}

      {screen === 'theme' && (
        <ThemePickerModal onSelect={handleSelectDeck} onBack={() => setScreen('mode')} />
      )}

      {screen === 'playing' && (
        <SafetyGame mode={mode} deckId={deckId} onDone={handleGameEnd} />
      )}
    </div>
  )
}
