# Safe or Not Safe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Safe or Not Safe" educational minigame accessible via a new Games tab, with caregiver-managed card decks in the dashboard.

**Architecture:** A new Games tab launches a modal game-picker (extensible for future games). Selecting "Safe or Not Safe" → mode picker (Shuffle All / Pick a Theme) → full-screen game loop. Game state is local React state (not Zustand). Dashboard gains a Safety Game section for managing cards and themed decks.

**Tech Stack:** React 19, Zustand (existing store, tab only), Supabase (3 new tables), Framer Motion (overlays), Tailwind CSS, Web Speech API (existing `speak()` utility).

---

## File Map

**New — Main App**
- `src/views/GamesView.jsx` — Games tab root, owns modal open/close state
- `src/components/games/GamePickerModal.jsx` — bottom sheet listing available games
- `src/components/games/ModePickerModal.jsx` — Shuffle All vs Pick a Theme
- `src/components/games/ThemePickerModal.jsx` — lists safety_decks to pick from
- `src/components/games/SafetyGame.jsx` — full game orchestrator (fetches cards, owns phase state)
- `src/components/games/SafetyCard.jsx` — card + flanking ✅/🚫 tap zones
- `src/components/games/FeedbackOverlay.jsx` — full-screen correct/wrong overlay
- `src/components/games/GameComplete.jsx` — end-of-session celebration screen

**Modified — Main App**
- `src/components/layout/BottomNav.jsx` — add Games tab (7th item, smaller text)
- `src/App.jsx` — import GamesView, render for `activeTab === 'games'`

**New — Dashboard**
- `dashboard/src/views/SafetyGameView.jsx` — tabbed: Cards sub-tab + Decks sub-tab
- `dashboard/src/components/safety/SafetyCardForm.jsx` — add/edit form with image upload
- `dashboard/src/components/safety/SafetyDeckManager.jsx` — deck CRUD + card assignment panel

**Modified — Dashboard**
- `dashboard/src/App.jsx` — add `safety` view
- `dashboard/src/components/layout/Sidebar.jsx` — add Safety Game nav item

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/safety-game-migration.sql`

- [ ] **Create the migration file**

```sql
-- supabase/safety-game-migration.sql

create table if not exists safety_cards (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  emoji text not null default '⭐',
  img_url text,
  is_safe boolean not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists safety_decks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  emoji text not null default '📁',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists safety_deck_cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references safety_decks(id) on delete cascade,
  card_id uuid references safety_cards(id) on delete cascade,
  sort_order int default 0,
  unique(deck_id, card_id)
);
```

- [ ] **Run the migration via Supabase MCP or dashboard SQL editor**

Open your Supabase project → SQL Editor → paste and run the file contents. Verify three new tables appear in the Table Editor.

- [ ] **Seed a few starter cards to test with**

Run in the SQL editor:

```sql
insert into safety_cards (label, emoji, is_safe) values
  ('Fire',             '🔥',  false),
  ('Knife',            '🔪',  false),
  ('Stranger',         '🧑',  false),
  ('Police Officer',   '👮',  true),
  ('Teacher',          '👩‍🏫', true),
  ('Firefighter',      '👨‍🚒', true),
  ('Hot Stove',        '🍳',  false),
  ('Medicine Bottle',  '💊',  false),
  ('Doctor',           '🩺',  true),
  ('Scissors',         '✂️',  false);

insert into safety_decks (label, emoji) values
  ('Kitchen', '🍳'),
  ('People',  '👥');

-- Assign fire, knife, hot stove, scissors to Kitchen
insert into safety_deck_cards (deck_id, card_id)
select d.id, c.id
from safety_decks d, safety_cards c
where d.label = 'Kitchen'
  and c.label in ('Fire', 'Knife', 'Hot Stove', 'Scissors');

-- Assign stranger, police, teacher, firefighter, doctor to People
insert into safety_deck_cards (deck_id, card_id)
select d.id, c.id
from safety_decks d, safety_cards c
where d.label = 'People'
  and c.label in ('Stranger', 'Police Officer', 'Teacher', 'Firefighter', 'Doctor');
```

- [ ] **Commit**

```bash
git add supabase/safety-game-migration.sql
git commit -m "feat: add safety_cards, safety_decks, safety_deck_cards tables"
```

---

## Task 2: Games Tab — BottomNav + App Shell

**Files:**
- Modify: `src/components/layout/BottomNav.jsx`
- Modify: `src/App.jsx`
- Create: `src/views/GamesView.jsx`

- [ ] **Update BottomNav.jsx — add Games tab with smaller label text for 7-item fit**

Replace the entire file:

```jsx
import { useStore } from '../../store/useStore'

const TABS = [
  { id: 'home',       label: 'Home',     emoji: '🏠' },
  { id: 'food',       label: 'Food',     emoji: '🍗' },
  { id: 'activities', label: 'Play',     emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings', emoji: '💛' },
  { id: 'people',     label: 'People',   emoji: '👥' },
  { id: 'routines',   label: 'Routines', emoji: '📋' },
  { id: 'games',      label: 'Games',    emoji: '🎮' },
]

const CATEGORY_ACTIVE = {
  home:       'text-act border-act',
  food:       'text-food border-food',
  activities: 'text-act border-act',
  feelings:   'text-feel border-feel',
  people:     'text-ppl border-ppl',
  routines:   'text-rtn border-rtn',
  games:      'text-ppl border-ppl',
}

export default function BottomNav() {
  const { activeTab, setActiveTab } = useStore()

  return (
    <nav
      className="flex-shrink-0 bg-card border-t border-bg2 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(72px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onTouchStart={() => setActiveTab(tab.id)}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 border-t-2 transition-colors
              ${isActive ? CATEGORY_ACTIVE[tab.id] : 'text-txt-l border-transparent'}`}
          >
            <span className="text-lg leading-none">{tab.emoji}</span>
            <span className={`text-[9px] font-body font-bold leading-none ${isActive ? '' : 'text-txt-m'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Create GamesView.jsx — tab root with modal state**

```jsx
// src/views/GamesView.jsx
import { useState } from 'react'
import GamePickerModal from '../components/games/GamePickerModal'
import ModePickerModal from '../components/games/ModePickerModal'
import ThemePickerModal from '../components/games/ThemePickerModal'
import SafetyGame from '../components/games/SafetyGame'

// modal stack: null | 'picker' | 'mode' | 'theme' | 'playing'
export default function GamesView() {
  const [screen, setScreen] = useState('picker')
  const [mode, setMode] = useState(null)    // 'shuffle' | 'theme'
  const [deckId, setDeckId] = useState(null)

  function handleSelectGame(gameId) {
    // Currently only one game; future games would branch here
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
      {/* Background placeholder when no modal is up */}
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
```

- [ ] **Update App.jsx — import GamesView and add route**

Add after the existing imports:
```jsx
import GamesView from './views/GamesView'
```

Add inside the `<main>` block after the routines line:
```jsx
{activeTab === 'games'     && <GamesView />}
```

- [ ] **Verify in browser** — tap the Games tab (🎮), see the games background + picker modal. No errors in console.

- [ ] **Commit**

```bash
git add src/components/layout/BottomNav.jsx src/App.jsx src/views/GamesView.jsx
git commit -m "feat: add Games tab to nav and GamesView shell"
```

---

## Task 3: GamePickerModal

**Files:**
- Create: `src/components/games/GamePickerModal.jsx`

- [ ] **Create GamePickerModal.jsx**

```jsx
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
```

- [ ] **Verify** — tapping "Safe or Not Safe" should advance to the mode screen (you'll see it crash or show empty since ModePickerModal doesn't exist yet — that's expected).

- [ ] **Commit**

```bash
git add src/components/games/GamePickerModal.jsx
git commit -m "feat: add GamePickerModal"
```

---

## Task 4: ModePickerModal + ThemePickerModal

**Files:**
- Create: `src/components/games/ModePickerModal.jsx`
- Create: `src/components/games/ThemePickerModal.jsx`

- [ ] **Create ModePickerModal.jsx**

```jsx
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
```

- [ ] **Create ThemePickerModal.jsx**

```jsx
// src/components/games/ThemePickerModal.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ThemePickerModal({ onSelect, onBack }) {
  const [decks, setDecks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('safety_decks')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        setDecks(data ?? [])
        setLoading(false)
      })
  }, [])

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
      <h2 className="font-display text-xl text-txt text-center mb-5">Pick a Theme</h2>

      {loading && <p className="text-center text-txt-m font-body">Loading…</p>}

      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
        {decks.map(deck => (
          <button
            key={deck.id}
            onTouchStart={() => onSelect(deck.id)}
            onClick={() => onSelect(deck.id)}
            className="w-full flex items-center gap-4 p-4 rounded-card bg-bg border-2 border-bg2
                       active:scale-[0.97] transition-transform duration-150"
          >
            <span className="text-3xl">{deck.emoji}</span>
            <p className="font-display text-lg text-txt">{deck.label}</p>
          </button>
        ))}
        {!loading && decks.length === 0 && (
          <p className="text-center text-txt-m font-body text-sm">No themes yet — add some in the dashboard.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Verify** — tap Games → Safe or Not Safe → both Shuffle All and Pick a Theme are tappable. Pick a Theme shows the seeded Kitchen and People decks. Selecting either should crash (SafetyGame not built yet) — that's fine.

- [ ] **Commit**

```bash
git add src/components/games/ModePickerModal.jsx src/components/games/ThemePickerModal.jsx
git commit -m "feat: add ModePickerModal and ThemePickerModal"
```

---

## Task 5: SafetyCard Component

**Files:**
- Create: `src/components/games/SafetyCard.jsx`

- [ ] **Create SafetyCard.jsx**

```jsx
// src/components/games/SafetyCard.jsx
import { useState } from 'react'

export default function SafetyCard({ card, onAnswer, disabled }) {
  const [pressing, setPressing] = useState(null) // 'safe' | 'unsafe' | null

  function handleTap(answer) {
    if (disabled) return
    setPressing(answer)
    setTimeout(() => setPressing(null), 150)
    onAnswer(answer)
  }

  return (
    <div className="flex items-center gap-3 w-full px-4">

      {/* Safe zone — left */}
      <button
        onTouchStart={() => handleTap('safe')}
        onClick={() => handleTap('safe')}
        disabled={disabled}
        className={`w-14 flex-shrink-0 bg-food-l border-2 border-food rounded-[20px]
                    flex flex-col items-center justify-center py-5 gap-1.5
                    transition-transform duration-150 disabled:opacity-60
                    ${pressing === 'safe' ? 'scale-90' : 'scale-100'}`}
      >
        <span className="text-2xl leading-none">✅</span>
        <span className="font-body font-bold text-[9px] text-food uppercase tracking-wide">Safe</span>
      </button>

      {/* Card — center */}
      <div className="flex-1 bg-card rounded-card shadow-card flex flex-col items-center justify-center gap-3 py-8">
        {card.img_url
          ? <img src={card.img_url} alt={card.label}
                 className="w-20 h-20 object-cover rounded-xl select-none" draggable={false} />
          : <span className="text-[72px] leading-none select-none">{card.emoji}</span>
        }
        <span className="font-display text-xl text-txt text-center px-2 leading-tight select-none">
          {card.label}
        </span>
      </div>

      {/* Not Safe zone — right */}
      <button
        onTouchStart={() => handleTap('unsafe')}
        onClick={() => handleTap('unsafe')}
        disabled={disabled}
        className={`w-14 flex-shrink-0 bg-feel-l border-2 border-feel rounded-[20px]
                    flex flex-col items-center justify-center py-5 gap-1.5
                    transition-transform duration-150 disabled:opacity-60
                    ${pressing === 'unsafe' ? 'scale-90' : 'scale-100'}`}
      >
        <span className="text-2xl leading-none">🚫</span>
        <span className="font-body font-bold text-[9px] text-feel uppercase tracking-wide leading-tight text-center">Not Safe</span>
      </button>

    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/games/SafetyCard.jsx
git commit -m "feat: add SafetyCard component with tap zones"
```

---

## Task 6: FeedbackOverlay

**Files:**
- Create: `src/components/games/FeedbackOverlay.jsx`

- [ ] **Create FeedbackOverlay.jsx**

```jsx
// src/components/games/FeedbackOverlay.jsx
import { useEffect } from 'react'
import { motion } from 'framer-motion'

// correct: true → green, false → orange
// card: the safety_card object
export default function FeedbackOverlay({ correct, card }) {
  const bg = correct
    ? 'from-food to-[#16a34a]'        // green gradient
    : 'from-act to-[#ea580c]'         // warm orange gradient

  const emoji   = correct ? '🎉' : '🤔'
  const heading = correct ? "That's right!" : "Let's try again!"
  const answer  = card.is_safe ? 'safe' : 'not safe'
  const detail  = `${card.label} is ${answer}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-5
                  bg-gradient-to-br ${bg}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="text-[80px] leading-none">{emoji}</span>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-3xl text-white">{heading}</p>
        <p className="font-body text-white text-lg opacity-90">{detail}</p>
      </div>
    </motion.div>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/games/FeedbackOverlay.jsx
git commit -m "feat: add FeedbackOverlay for correct/wrong answers"
```

---

## Task 7: GameComplete Screen

**Files:**
- Create: `src/components/games/GameComplete.jsx`

- [ ] **Create GameComplete.jsx**

```jsx
// src/components/games/GameComplete.jsx
import { motion } from 'framer-motion'

export default function GameComplete({ onPlayAgain, onDone }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-bg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <span className="text-[90px] leading-none">🏆</span>
      <div className="flex flex-col items-center gap-2">
        <p className="font-display text-3xl text-txt">All done, Benny!</p>
        <p className="font-body text-txt-m text-base">Great job!</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-[260px]">
        <button
          onTouchStart={onPlayAgain}
          onClick={onPlayAgain}
          className="w-full py-4 rounded-btn bg-ppl text-white font-display text-xl
                     shadow-btn active:scale-[0.97] transition-transform duration-150"
        >
          Play Again
        </button>
        <button
          onTouchStart={onDone}
          onClick={onDone}
          className="w-full py-4 rounded-btn bg-bg2 text-txt font-display text-xl
                     shadow-btn active:scale-[0.97] transition-transform duration-150"
        >
          Done
        </button>
      </div>
    </motion.div>
  )
}
```

- [ ] **Commit**

```bash
git add src/components/games/GameComplete.jsx
git commit -m "feat: add GameComplete celebration screen"
```

---

## Task 8: SafetyGame Orchestrator

**Files:**
- Create: `src/components/games/SafetyGame.jsx`

This is the main game component. It fetches the card set, manages phase state, fires `speak()`, and auto-advances after feedback.

- [ ] **Create SafetyGame.jsx**

```jsx
// src/components/games/SafetyGame.jsx
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { speak } from '../../lib/speech'
import { useStore } from '../../store/useStore'
import SafetyCard from './SafetyCard'
import FeedbackOverlay from './FeedbackOverlay'
import GameComplete from './GameComplete'

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// phase: 'loading' | 'question' | 'feedback' | 'complete'
export default function SafetyGame({ mode, deckId, onDone }) {
  const { settings } = useStore()
  const [cards, setCards]         = useState([])
  const [index, setIndex]         = useState(0)
  const [phase, setPhase]         = useState('loading')
  const [lastCorrect, setCorrect] = useState(null)
  const timerRef                  = useRef(null)

  // Fetch cards on mount
  useEffect(() => {
    async function load() {
      let data
      if (mode === 'shuffle') {
        const res = await supabase.from('safety_cards').select('*').order('sort_order')
        data = res.data ?? []
      } else {
        // theme mode — join through safety_deck_cards
        const res = await supabase
          .from('safety_deck_cards')
          .select('safety_cards(*)')
          .eq('deck_id', deckId)
          .order('sort_order')
        data = (res.data ?? []).map(r => r.safety_cards)
      }
      setCards(shuffle(data))
      setPhase('question')
    }
    load()
  }, [mode, deckId])

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const card = cards[index]

  function handleAnswer(answer) {
    if (phase !== 'question' || !card) return

    // Speak the card label immediately
    speak(card.label, { rate: settings.voiceRate, pitch: settings.voicePitch })

    const isCorrect = answer === (card.is_safe ? 'safe' : 'unsafe')
    setCorrect(isCorrect)
    setPhase('feedback')

    // Speak the reinforcement phrase after a short pause (fire-and-forget, short delay)
    const reinforcement = `${card.label} is ${card.is_safe ? 'safe' : 'not safe'}`
    setTimeout(() => {
      speak(reinforcement, { rate: settings.voiceRate, pitch: settings.voicePitch })
    }, 400)

    // Auto-advance — store in ref so we can cancel on unmount
    const delay = isCorrect ? 1800 : 2200
    timerRef.current = setTimeout(() => advance(), delay)
  }

  function advance() {
    setPhase('question')
    setCorrect(null)
    if (index + 1 >= cards.length) {
      setPhase('complete')
    } else {
      setIndex(i => i + 1)
    }
  }

  function handlePlayAgain() {
    setCards(c => shuffle(c))
    setIndex(0)
    setPhase('question')
    setCorrect(null)
  }

  if (phase === 'loading') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-bg">
        <p className="font-body text-txt-m">Loading…</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-bg"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
           style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <p className="font-display text-lg text-txt-m">Safe or Not Safe?</p>
        <button
          onTouchStart={onDone}
          onClick={onDone}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg text-txt-m font-body font-bold"
        >
          ✕
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 px-4 mb-6 flex-shrink-0 flex-wrap">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < index ? 'bg-food w-5'
              : i === index ? 'bg-food w-5 opacity-60'
              : 'bg-bg2 w-2'
            }`}
          />
        ))}
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center">
        {card && (
          <SafetyCard
            card={card}
            onAnswer={handleAnswer}
            disabled={phase !== 'question'}
          />
        )}
      </div>

      {/* Prompt */}
      <p className="text-center font-body text-txt-l text-sm pb-6 flex-shrink-0">
        Is this safe or not safe?
      </p>

      {/* Feedback overlay */}
      <AnimatePresence>
        {phase === 'feedback' && card && (
          <FeedbackOverlay key="feedback" correct={lastCorrect} card={card} />
        )}
      </AnimatePresence>

      {/* Complete screen */}
      <AnimatePresence>
        {phase === 'complete' && (
          <GameComplete key="complete" onPlayAgain={handlePlayAgain} onDone={onDone} />
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Verify full game loop in the running app:**
  1. Tap Games → Safe or Not Safe → Shuffle All
  2. A card appears with ✅ left, 🚫 right
  3. Tap correct side → green overlay appears, voice speaks, auto-advances
  4. Tap wrong side → orange overlay, voice states correct answer, auto-advances
  5. After all cards → 🏆 completion screen
  6. Play Again reshuffles; Done returns to Games tab
  7. Repeat with Pick a Theme → Kitchen → only Kitchen cards appear

- [ ] **Commit**

```bash
git add src/components/games/SafetyGame.jsx
git commit -m "feat: SafetyGame orchestrator — full game loop working"
```

---

## Task 9: Dashboard — Safety Game Section

**Files:**
- Create: `dashboard/src/components/safety/SafetyCardForm.jsx`
- Create: `dashboard/src/components/safety/SafetyDeckManager.jsx`
- Create: `dashboard/src/views/SafetyGameView.jsx`
- Modify: `dashboard/src/components/layout/Sidebar.jsx`
- Modify: `dashboard/src/App.jsx`

- [ ] **Create SafetyCardForm.jsx** (add/edit a safety card with image upload)

```jsx
// dashboard/src/components/safety/SafetyCardForm.jsx
import { useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const QUICK_EMOJIS = ['🔥','🔪','✂️','💊','🧑','🚗','⚡','🐶','👮','👩‍🏫','👨‍🚒','🩺','🏫','🚒','🏠','🌊']

async function uploadImage(file) {
  const ext = file.name.split('.').pop()
  const path = `safety/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('card-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return data.publicUrl
}

export default function SafetyCardForm({ onSaved, onCancel }) {
  const [label, setLabel]         = useState('')
  const [emoji, setEmoji]         = useState('🔥')
  const [isSafe, setIsSafe]       = useState(false)
  const [imgFile, setImgFile]     = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState(null)
  const fileRef                   = useRef(null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgPreview(URL.createObjectURL(file))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!label.trim() || saving) return
    setSaving(true)
    setError(null)

    let img_url = null
    if (imgFile) {
      try { img_url = await uploadImage(imgFile) }
      catch (err) { setError(`Upload failed: ${err.message}`); setSaving(false); return }
    }

    const { error: dbErr } = await supabase.from('safety_cards').insert({
      label: label.trim(), emoji, img_url, is_safe: isSafe, sort_order: Date.now(),
    })
    if (dbErr) { setError(dbErr.message); setSaving(false) }
    else onSaved()
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
      <h3 className="font-bold text-slate-800 text-lg mb-5">New Safety Card</h3>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Label</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Fire"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 mb-4" />

          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Answer</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => setIsSafe(true)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition
                ${isSafe ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 text-slate-500'}`}>
              ✅ Safe
            </button>
            <button type="button" onClick={() => setIsSafe(false)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition
                ${!isSafe ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500'}`}>
              🚫 Not Safe
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Image <span className="normal-case font-normal text-slate-400">(optional)</span>
          </label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFile} className="hidden" />

          {imgPreview
            ? <div className="flex items-center gap-3 mb-4">
                <img src={imgPreview} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-blue-500 hover:text-blue-700">Replace</button>
                  <button type="button" onClick={() => { setImgPreview(null); setImgFile(null) }} className="text-xs text-slate-400 hover:text-red-500">Remove</button>
                </div>
              </div>
            : <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition mb-4 flex flex-col items-center gap-1">
                <span className="text-xl">📷</span>
                <span className="font-semibold">Upload image</span>
              </button>
          }

          {!imgPreview && (
            <>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Emoji</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`text-xl p-1.5 rounded-lg border-2 transition ${emoji === e ? 'border-blue-400 bg-blue-50' : 'border-transparent hover:border-slate-200'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="submit" disabled={!label.trim() || saving}
          className="px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition disabled:opacity-50">
          {saving ? 'Saving…' : 'Add Card'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
          Cancel
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Create SafetyDeckManager.jsx** (deck CRUD + card assignment)

```jsx
// dashboard/src/components/safety/SafetyDeckManager.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SafetyDeckManager({ allCards }) {
  const [decks, setDecks]           = useState([])
  const [deckCards, setDeckCards]   = useState([]) // { id, deck_id, card_id }
  const [openDeck, setOpenDeck]     = useState(null)
  const [newDeckLabel, setNewLabel] = useState('')
  const [newDeckEmoji, setNewEmoji] = useState('📁')
  const [adding, setAdding]         = useState(false)

  async function loadDecks() {
    const [{ data: d }, { data: dc }] = await Promise.all([
      supabase.from('safety_decks').select('*').order('sort_order'),
      supabase.from('safety_deck_cards').select('*'),
    ])
    setDecks(d ?? [])
    setDeckCards(dc ?? [])
    if (!openDeck && d?.length) setOpenDeck(d[0].id)
  }

  useEffect(() => { loadDecks() }, [])

  async function createDeck(e) {
    e.preventDefault()
    if (!newDeckLabel.trim()) return
    const { data } = await supabase.from('safety_decks')
      .insert({ label: newDeckLabel.trim(), emoji: newDeckEmoji, sort_order: Date.now() })
      .select().single()
    if (data) { setDecks(prev => [...prev, data]); setOpenDeck(data.id) }
    setNewLabel('')
  }

  async function deleteDeck(id) {
    if (!confirm('Delete this theme? Cards are not deleted.')) return
    await supabase.from('safety_decks').delete().eq('id', id)
    setDecks(prev => prev.filter(d => d.id !== id))
    setDeckCards(prev => prev.filter(dc => dc.deck_id !== id))
    if (openDeck === id) setOpenDeck(decks.find(d => d.id !== id)?.id ?? null)
  }

  async function addToDeck(deckId, cardId) {
    setAdding(true)
    const { data } = await supabase.from('safety_deck_cards')
      .insert({ deck_id: deckId, card_id: cardId, sort_order: Date.now() }).select()
    if (data?.[0]) setDeckCards(prev => [...prev, data[0]])
    setAdding(false)
  }

  async function removeFromDeck(deckId, cardId) {
    await supabase.from('safety_deck_cards').delete().eq('deck_id', deckId).eq('card_id', cardId)
    setDeckCards(prev => prev.filter(dc => !(dc.deck_id === deckId && dc.card_id === cardId)))
  }

  const activeDeck = decks.find(d => d.id === openDeck)
  const inDeck = (deckId) => deckCards.filter(dc => dc.deck_id === deckId).map(dc => dc.card_id)
  const assignedIds = openDeck ? inDeck(openDeck) : []
  const assignedCards = allCards.filter(c => assignedIds.includes(c.id))
  const unassignedCards = allCards.filter(c => !assignedIds.includes(c.id))

  return (
    <div>
      {/* Create deck form */}
      <form onSubmit={createDeck} className="flex gap-3 mb-6">
        <input value={newDeckEmoji} onChange={e => setNewEmoji(e.target.value)} className="w-14 border border-slate-200 rounded-xl text-center text-xl p-2 outline-none" />
        <input value={newDeckLabel} onChange={e => setNewLabel(e.target.value)} placeholder="New theme name…"
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400" />
        <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition">Add</button>
      </form>

      {/* Deck tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {decks.map(d => (
          <button key={d.id} onClick={() => setOpenDeck(d.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition
              ${openDeck === d.id ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
            {d.emoji} {d.label}
            <span className="text-xs opacity-70">({inDeck(d.id).length})</span>
          </button>
        ))}
      </div>

      {activeDeck && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* In deck */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">In "{activeDeck.label}"</h3>
              <button onClick={() => deleteDeck(activeDeck.id)} className="text-xs text-slate-400 hover:text-red-500 transition">Delete theme</button>
            </div>
            <div className="divide-y divide-slate-50">
              {assignedCards.map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {card.img_url
                      ? <img src={card.img_url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                      : <span className="text-lg">{card.emoji}</span>}
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                    <span className={`text-xs font-semibold ${card.is_safe ? 'text-green-600' : 'text-red-600'}`}>
                      {card.is_safe ? '✅' : '🚫'}
                    </span>
                  </div>
                  <button onClick={() => removeFromDeck(activeDeck.id, card.id)} className="text-xs text-slate-400 hover:text-red-500 transition font-medium">Remove</button>
                </div>
              ))}
              {assignedCards.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">No cards yet.</p>}
            </div>
          </div>

          {/* Not in deck */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-700 mb-4">Add to "{activeDeck.label}"</h3>
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
              {unassignedCards.map(card => (
                <div key={card.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    {card.img_url
                      ? <img src={card.img_url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                      : <span className="text-lg">{card.emoji}</span>}
                    <span className="text-sm font-medium text-slate-700">{card.label}</span>
                    <span className={`text-xs font-semibold ${card.is_safe ? 'text-green-600' : 'text-red-600'}`}>
                      {card.is_safe ? '✅' : '🚫'}
                    </span>
                  </div>
                  <button onClick={() => addToDeck(activeDeck.id, card.id)} disabled={adding}
                    className="text-xs text-blue-500 hover:text-blue-700 font-semibold transition disabled:opacity-50">+ Add</button>
                </div>
              ))}
              {unassignedCards.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">All cards assigned.</p>}
            </div>
          </div>
        </div>
      )}
      {decks.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No themes yet. Create one above.</p>}
    </div>
  )
}
```

- [ ] **Create SafetyGameView.jsx** (top-level dashboard view with Cards / Decks sub-tabs)

```jsx
// dashboard/src/views/SafetyGameView.jsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import SafetyCardForm from '../components/safety/SafetyCardForm'
import SafetyDeckManager from '../components/safety/SafetyDeckManager'

const SUB_TABS = ['Cards', 'Themes']

export default function SafetyGameView() {
  const [subTab, setSubTab] = useState('Cards')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadCards = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('safety_cards').select('*').order('sort_order')
    setCards(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadCards() }, [loadCards])

  async function handleDelete(id) {
    if (!confirm('Delete this card?')) return
    await supabase.from('safety_cards').delete().eq('id', id)
    setCards(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🛡️ Safety Game</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage cards and themed decks</p>
        </div>
        {subTab === 'Cards' && (
          <button onClick={() => setShowForm(v => !v)}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition">
            {showForm ? 'Cancel' : '+ Add Card'}
          </button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        {SUB_TABS.map(t => (
          <button key={t} onClick={() => { setSubTab(t); setShowForm(false) }}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${subTab === t ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {subTab === 'Cards' && (
        <>
          {showForm && (
            <SafetyCardForm
              onSaved={() => { setShowForm(false); loadCards() }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {loading ? <div className="text-slate-400 text-sm">Loading…</div> : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Card</th>
                    <th className="text-left px-5 py-3">Answer</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {cards.map(card => (
                    <tr key={card.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {card.img_url
                            ? <img src={card.img_url} alt={card.label} className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                            : <span className="text-2xl">{card.emoji}</span>}
                          <span className="font-medium text-slate-700">{card.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${card.is_safe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {card.is_safe ? '✅ Safe' : '🚫 Not Safe'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => handleDelete(card.id)} className="text-slate-400 hover:text-red-500 transition text-xs font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cards.length === 0 && <div className="px-5 py-10 text-center text-slate-400 text-sm">No safety cards yet.</div>}
            </div>
          )}
        </>
      )}

      {subTab === 'Themes' && <SafetyDeckManager allCards={cards} />}
    </div>
  )
}
```

- [ ] **Update dashboard Sidebar.jsx — add Safety Game nav item**

In `dashboard/src/components/layout/Sidebar.jsx`, update the `NAV` array:

```js
const NAV = [
  { id: 'analytics', label: 'Analytics',    icon: '📊' },
  { id: 'cards',     label: 'Cards',        icon: '🃏' },
  { id: 'presets',   label: 'Presets',      icon: '📋' },
  { id: 'safety',    label: 'Safety Game',  icon: '🛡️' },
]
```

- [ ] **Update dashboard App.jsx — import and render SafetyGameView**

Add import:
```js
import SafetyGameView from './views/SafetyGameView'
```

Add render in the `<main>` block:
```jsx
{activeView === 'safety' && <SafetyGameView />}
```

- [ ] **Verify dashboard** — navigate to 🛡️ Safety Game. Cards tab shows seeded cards with ✅/🚫 badges. Add a card with an image. Switch to Themes tab, see Kitchen and People decks, add/remove cards from them.

- [ ] **Commit**

```bash
git add dashboard/src/components/safety/ dashboard/src/views/SafetyGameView.jsx
git add dashboard/src/components/layout/Sidebar.jsx dashboard/src/App.jsx
git commit -m "feat: dashboard Safety Game section — cards and theme management"
```

---

## Self-Review Checklist (do not skip)

After implementing all tasks, verify against the spec:

- [ ] Games tab appears in bottom nav and is tappable
- [ ] Game picker shows "Safe or Not Safe" + future games placeholder
- [ ] Shuffle All fetches all `safety_cards` and shuffles them
- [ ] Pick a Theme shows decks from `safety_decks`, loads only that deck's cards
- [ ] Tapping correct zone → green overlay, voice speaks reinforcement, auto-advances in 1.8s
- [ ] Tapping wrong zone → orange overlay, voice speaks correct answer, auto-advances in 2.2s
- [ ] Progress dots show filled for answered cards, grey for remaining
- [ ] Completion screen shows 🏆, Play Again reshuffles, Done returns to Games tab
- [ ] ✕ button exits mid-game cleanly
- [ ] Dashboard: add safety card with image → appears in app on next game start
- [ ] Dashboard: create theme, assign cards → theme appears in Theme Picker
- [ ] Cards with `img_url` show photo in game; cards without show emoji
