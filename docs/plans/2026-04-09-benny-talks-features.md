# Benny Talks Phase 2 Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 4 features to Benny Talks: full timer system, repositioned preset pill in header, expanded settings panel, and enhanced transition chime button.

**Architecture:** All new state goes into useStore.js; new overlay components mount in App.jsx inside AnimatePresence; existing Header/SettingsModal are refactored in-place. No new routes or views needed.

**Tech Stack:** React 19, Zustand 5 (persist), Framer Motion 12, Web Audio API, Web Speech API, Tailwind CSS v3, Supabase JS 2

---

### Task 1: Fix sounds.js chime and TimerPill thresholds

**Files:**
- Modify: `src/lib/sounds.js:25-30`
- Modify: `src/components/overlay/TimerPill.jsx:14-16`

**Step 1: Update playTimerChime to use C5 E5 G5 C6**

In `src/lib/sounds.js` replace the notes array in `playTimerChime`:

```js
// Old: [261.63, 329.63, 392.00, 523.25] // C4 E4 G4 C5
// New:
const notes = [523.25, 659.25, 783.99, 1046.50] // C5 E5 G5 C6
```

**Step 2: Update TimerPill color thresholds**

In `src/components/overlay/TimerPill.jsx` change thresholds from 50%/20% to 40%/20%:

```jsx
const colorClass = pct > 0.4 ? 'border-transparent text-txt'
  : pct > 0.2 ? 'border-act text-act'
  : 'border-feel text-feel animate-pulse'
```

**Step 3: Verify in browser**
- Start a 1-minute timer, watch pill: should be neutral color first 36s, amber 36–48s, red+pulse last 12s
- Let timer complete, hear higher-pitched chime

**Step 4: Commit**

```bash
git add src/lib/sounds.js src/components/overlay/TimerPill.jsx
git commit -m "fix: raise timer chime octave and update pill color thresholds"
```

---

### Task 2: Extend Zustand store with new state and actions

**Files:**
- Modify: `src/store/useStore.js`

New state fields to add inside the store object (alongside existing state):

```js
// ── TIMER PICKER ──
timerPickerOpen: false,
timerDoneVisible: false,

// ── TRANSITION OVERLAY ──
transitionOverlayVisible: false,

// ── SETTINGS additions (add into existing settings object) ──
// webhookUrl: ''   ← add this key to the settings: {} object
```

New actions to add:

```js
openTimerPicker: () => set({ timerPickerOpen: true }),
closeTimerPicker: () => set({ timerPickerOpen: false }),

showTimerDone: () => set({ timerDoneVisible: true }),
dismissTimerDone: () => set({ timerDoneVisible: false }),

showTransitionOverlay: () => set({ transitionOverlayVisible: true }),
dismissTransitionOverlay: () => set({ transitionOverlayVisible: false }),

updatePresetCards: (presetId, cardIds) =>
  set(s => ({ presetCards: { ...s.presetCards, [presetId]: cardIds } })),
```

Modify `startTimer` so when remainingSecs hits 0 it calls `showTimerDone` instead of just playing chime:

```js
if (timer.remainingSecs <= 1) {
  clearInterval(timer.intervalId)
  playTimerChime()
  set({ timer: { running: false, paused: false, totalSecs: 0, remainingSecs: 0, label: null, intervalId: null } })
  get().showTimerDone()   // ← add this line
  return
}
```

Add `webhookUrl: ''` to the `settings:` object and add `webhookUrl` to the `partialize` selections.

**Step 1: Add timerPickerOpen, timerDoneVisible, transitionOverlayVisible to state**

**Step 2: Add webhookUrl: '' to settings object**

**Step 3: Add all new actions**

**Step 4: Modify startTimer interval to call showTimerDone on completion**

**Step 5: Add webhookUrl to partialize**

**Step 6: Commit**

```bash
git add src/store/useStore.js
git commit -m "feat: add timer picker/done/transition overlay state and actions to store"
```

---

### Task 3: Restructure Header.jsx

**Files:**
- Modify: `src/components/layout/Header.jsx`

**Target layout:**

```
┌─────────────────────────────────────────────┐
│ [🗣️ Benny Talks]          [🔔] [⏱️] [⚙️] │
│ [📍 Preset Pill ›]                          │
└─────────────────────────────────────────────┘
```

- Left column: logo row + preset pill row stacked vertically, `flex-1`
- Right column: 3 icon buttons (bell, timer, gear), `flex-shrink-0`
- Timer pill: when `timer.running`, show in center between left and right columns

**New Header.jsx:**

```jsx
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
```

**Step 1: Replace Header.jsx with the above**

**Step 2: Verify in browser — logo + preset pill stack on left, 3 buttons on right, timer pill appears center when timer running**

**Step 3: Commit**

```bash
git add src/components/layout/Header.jsx
git commit -m "feat: restructure header — preset pill below logo, add timer button"
```

---

### Task 4: Create TimerPicker.jsx (bottom sheet)

**Files:**
- Create: `src/components/overlay/TimerPicker.jsx`
- Modify: `src/App.jsx` (add TimerPicker + TransitionOverlay + TimerDoneOverlay to AnimatePresence)

**TimerPicker.jsx:**

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

const PRESETS = [
  { label: '30s', secs: 30 },
  { label: '1 min', secs: 60 },
  { label: '2 min', secs: 120 },
  { label: '3 min', secs: 180 },
  { label: '5 min', secs: 300 },
  { label: '10 min', secs: 600 },
]

export default function TimerPicker() {
  const { timerPickerOpen, closeTimerPicker, startTimer, cancelTimer } = useStore()

  function handlePick(secs) {
    startTimer(secs)
    closeTimerPicker()
  }

  function handleCancel() {
    cancelTimer()
    closeTimerPicker()
  }

  return (
    <AnimatePresence>
      {timerPickerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="timer-picker-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 z-40"
            onTouchStart={handleCancel}
            onClick={handleCancel}
          />
          {/* Sheet */}
          <motion.div
            key="timer-picker-sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 bg-bg rounded-t-[24px] z-50 p-6"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-txt">Set a Timer</h2>
              <button
                onTouchStart={handleCancel}
                onClick={handleCancel}
                className="w-8 h-8 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PRESETS.map(({ label, secs }) => (
                <button
                  key={secs}
                  onTouchStart={() => handlePick(secs)}
                  onClick={() => handlePick(secs)}
                  className="bg-card rounded-btn py-4 flex flex-col items-center justify-center shadow-btn active:bg-bg2 transition-colors"
                >
                  <span className="font-display text-2xl text-act">{label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 1: Create the file above**

**Step 2: Add TimerPicker to App.jsx**

In `src/App.jsx`:
- Import: `import TimerPicker from './components/overlay/TimerPicker'`
- Add to store destructure: `timerPickerOpen`
- Add after the settingsOpen AnimatePresence block:
```jsx
<AnimatePresence>
  {timerPickerOpen && <TimerPicker key="timer-picker" />}
</AnimatePresence>
```

Note: TimerPicker manages its own AnimatePresence internally, so in App.jsx just render `<TimerPicker />` unconditionally (it handles its own open state) — OR render it inside AnimatePresence conditionally. Either works; unconditional is simpler since TimerPicker handles its own AnimatePresence.

Actually, simplest: render `<TimerPicker />` unconditionally in App (no AnimatePresence wrapper in App) since TimerPicker has its own AnimatePresence.

**Step 3: Verify in browser — tap ⏱️, bottom sheet slides up with 6 timer buttons, tap one starts timer and closes sheet**

**Step 4: Commit**

```bash
git add src/components/overlay/TimerPicker.jsx src/App.jsx
git commit -m "feat: add TimerPicker bottom sheet with 30s–10min presets"
```

---

### Task 5: Create TimerDoneOverlay.jsx (celebration screen)

**Files:**
- Create: `src/components/overlay/TimerDoneOverlay.jsx`
- Modify: `src/App.jsx` (add TimerDoneOverlay)

**TimerDoneOverlay.jsx:**

```jsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { speak } from '../../lib/speech'

export default function TimerDoneOverlay() {
  const { timerDoneVisible, dismissTimerDone, settings } = useStore()

  useEffect(() => {
    if (timerDoneVisible) {
      speak("Time's up! Great waiting!", { rate: settings.voiceRate, pitch: settings.voicePitch })
    }
  }, [timerDoneVisible])

  return (
    <AnimatePresence>
      {timerDoneVisible && (
        <motion.div
          key="timer-done"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="absolute inset-0 bg-[#FDF6EE]/95 z-50 flex flex-col items-center justify-center gap-6"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="text-center">
            <p className="font-display text-3xl text-txt">Time's up!</p>
            <p className="font-body text-lg text-txt-m mt-1">Great waiting!</p>
          </div>
          <button
            onTouchStart={dismissTimerDone}
            onClick={dismissTimerDone}
            className="bg-act text-white font-display text-xl rounded-pill px-10 py-4 shadow-btn active:opacity-80"
          >
            🎉 Yay!
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 1: Create TimerDoneOverlay.jsx**

**Step 2: Add to App.jsx**

Import and render unconditionally (it has own AnimatePresence):
```jsx
import TimerDoneOverlay from './components/overlay/TimerDoneOverlay'
// In JSX:
<TimerDoneOverlay />
```

**Step 3: Verify — let a short timer (30s) run to completion, celebration overlay appears with 🎉, speech fires, dismiss works**

**Step 4: Commit**

```bash
git add src/components/overlay/TimerDoneOverlay.jsx src/App.jsx
git commit -m "feat: add timer done celebration overlay with speech"
```

---

### Task 6: Enhanced transition chime (bell animation + TransitionOverlay)

**Files:**
- Create: `src/components/overlay/TransitionOverlay.jsx`
- Modify: `src/App.jsx` (add TransitionOverlay)

Note: Header.jsx already calls `showTransitionOverlay()` and `speak('Time to switch!')` in `handleChime` (from Task 3). This task adds the visual overlay.

**TransitionOverlay.jsx:**

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function TransitionOverlay() {
  const { transitionOverlayVisible, dismissTransitionOverlay } = useStore()

  return (
    <AnimatePresence>
      {transitionOverlayVisible && (
        <motion.div
          key="transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-act/20 z-50 flex flex-col items-center justify-center gap-6 px-8"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-7xl"
          >
            🔔
          </motion.div>
          <div className="bg-white rounded-card shadow-modal p-6 w-full max-w-sm text-center">
            <p className="font-display text-2xl text-act">Time to switch!</p>
            <p className="font-body text-base text-txt-m mt-2">Let's try something new</p>
            <button
              onTouchStart={dismissTransitionOverlay}
              onClick={dismissTransitionOverlay}
              className="mt-5 bg-act text-white font-display text-lg rounded-pill px-8 py-3 shadow-btn active:opacity-80 w-full"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 1: Create TransitionOverlay.jsx**

**Step 2: Add to App.jsx**

```jsx
import TransitionOverlay from './components/overlay/TransitionOverlay'
// In JSX:
<TransitionOverlay />
```

**Step 3: Verify — tap bell button in header, chime plays + "Time to switch!" speech + amber overlay appears, OK dismisses it**

**Step 4: Commit**

```bash
git add src/components/overlay/TransitionOverlay.jsx src/App.jsx
git commit -m "feat: add transition overlay — amber overlay + speech on bell tap"
```

---

### Task 7: Expand SettingsModal.jsx with all 7 sections

**Files:**
- Modify: `src/components/settings/SettingsModal.jsx`

This is the largest task. Replace the current minimal settings with a full 7-section panel.

**Sections:**

1. **CARDS** — "Add a Card" row (existing) + "Browse & Edit Cards" row (new, shows card list with delete per category)
2. **PRESETS** — list of presets, each row tappable to open PresetEditor view
3. **ANALYTICS** — text input for webhook URL
4. **VOICE** — Speed + Pitch sliders (existing)
5. **SOUND** — Transition Chime toggle (existing)
6. **DATA** — "Export as CSV" button + "Clear All Data" button (with confirm dialog)
7. **STATS** — today's taps, all-time taps, top word, 8 most recent taps

**Implementation approach:**
- Keep the existing view state pattern (`view` useState)
- Add more views: `'main'`, `'addCard'`, `'browseCards'`, `'editPreset'`
- Stats are read from `tap_log` table on mount (Supabase query)
- CSV export: generate from `tap_log` rows, use data URL download
- Clear All Data: confirm then truncate local cards/presets/presetCards back to defaults, clear localStorage

**Full replacement for SettingsModal.jsx:**

```jsx
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from '../../lib/defaultData'
import AddCard from './AddCard'

export default function SettingsModal() {
  const {
    settingsOpen, closeSettings, settings, updateSettings,
    presets, cards, updatePresetCards, presetCards,
  } = useStore()
  const [view, setView] = useState('main')
  const [editPreset, setEditPreset] = useState(null)
  const [stats, setStats] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl ?? '')

  useEffect(() => {
    if (settingsOpen) fetchStats()
  }, [settingsOpen])

  async function fetchStats() {
    try {
      const { data } = await supabase
        .from('tap_log')
        .select('card_label, created_at')
        .eq('event_type', 'card_tap')
        .order('created_at', { ascending: false })
        .limit(200)
      if (!data) return
      const today = new Date().toDateString()
      const todayTaps = data.filter(r => new Date(r.created_at).toDateString() === today).length
      const counts = {}
      data.forEach(r => { counts[r.card_label] = (counts[r.card_label] ?? 0) + 1 })
      const topWord = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
      setStats({ total: data.length, todayTaps, topWord, recent: data.slice(0, 8) })
    } catch {}
  }

  async function handleExportCSV() {
    try {
      const { data } = await supabase.from('tap_log').select('*').order('created_at', { ascending: false })
      if (!data?.length) return
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(r => Object.values(r).map(v => JSON.stringify(v ?? '')).join(','))
      const csv = [headers, ...rows].join('\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url; a.download = 'benny-talks-export.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  function handleClearData() {
    if (!confirmClear) { setConfirmClear(true); return }
    useStore.setState({
      cards: DEFAULT_CARDS, presets: DEFAULT_PRESETS,
      presetCards: DEFAULT_PRESET_CARDS, routines: DEFAULT_ROUTINES,
      routineSteps: DEFAULT_ROUTINE_STEPS, activePresetId: 'preset-home',
    })
    localStorage.removeItem('benny-talks-store')
    setConfirmClear(false)
  }

  function getTitle() {
    if (view === 'addCard') return 'Add a Card'
    if (view === 'browseCards') return 'Browse Cards'
    if (view === 'editPreset') return editPreset?.label ?? 'Edit Preset'
    return 'Settings'
  }

  function handleBack() {
    if (view === 'addCard' || view === 'browseCards' || view === 'editPreset') setView('main')
    else { setView('main'); closeSettings() }
  }

  function handleClose() { setView('main'); setConfirmClear(false); closeSettings() }

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="absolute inset-0 bg-bg z-50 flex flex-col overflow-hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-bg2"
            style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
          >
            <h2 className="font-display text-xl text-txt">{getTitle()}</h2>
            <button
              onTouchStart={view !== 'main' ? () => setView('main') : handleClose}
              onClick={view !== 'main' ? () => setView('main') : handleClose}
              className="w-9 h-9 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-bold"
            >
              {view !== 'main' ? '←' : '✕'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'main' && (
              <MainView
                settings={settings}
                updateSettings={updateSettings}
                presets={presets}
                cards={cards}
                stats={stats}
                webhookUrl={webhookUrl}
                setWebhookUrl={v => { setWebhookUrl(v); updateSettings({ webhookUrl: v }) }}
                confirmClear={confirmClear}
                setConfirmClear={setConfirmClear}
                onAddCard={() => setView('addCard')}
                onBrowseCards={() => setView('browseCards')}
                onEditPreset={p => { setEditPreset(p); setView('editPreset') }}
                onExportCSV={handleExportCSV}
                onClearData={handleClearData}
              />
            )}
            {view === 'addCard' && <AddCard onClose={() => setView('main')} />}
            {view === 'browseCards' && <BrowseCardsView cards={cards} />}
            {view === 'editPreset' && editPreset && (
              <PresetEditorView
                preset={editPreset}
                cards={cards}
                currentCardIds={presetCards[editPreset.id] ?? []}
                onUpdate={cardIds => updatePresetCards(editPreset.id, cardIds)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MainView({ settings, updateSettings, presets, cards, stats, webhookUrl, setWebhookUrl, confirmClear, setConfirmClear, onAddCard, onBrowseCards, onEditPreset, onExportCSV, onClearData }) {
  return (
    <div className="flex flex-col gap-1 p-4">
      {/* CARDS */}
      <SectionLabel>Cards</SectionLabel>
      <SettingsRow icon="➕" label="Add a Card" onPress={onAddCard} />
      <SettingsRow icon="📋" label="Browse & Edit Cards" onPress={onBrowseCards} />

      {/* PRESETS */}
      <SectionLabel>Presets</SectionLabel>
      <div className="flex flex-col gap-1">
        {presets.map(p => (
          <SettingsRow key={p.id} icon={p.icon ?? '⭐'} label={p.label} onPress={() => onEditPreset(p)} />
        ))}
      </div>

      {/* ANALYTICS */}
      <SectionLabel>Analytics</SectionLabel>
      <div className="bg-card rounded-btn p-4">
        <label className="font-body font-bold text-sm text-txt block mb-2">Webhook URL</label>
        <input
          type="url"
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.example.com/..."
          className="w-full bg-bg2 rounded-btn px-3 py-2 font-body text-sm text-txt placeholder:text-txt-l outline-none"
        />
      </div>

      {/* VOICE */}
      <SectionLabel>Voice</SectionLabel>
      <div className="bg-card rounded-btn p-4 flex flex-col gap-4">
        <SliderRow label="Speed" value={settings.voiceRate} min={0.5} max={1.2} step={0.05}
          onChange={v => updateSettings({ voiceRate: v })} />
        <SliderRow label="Pitch" value={settings.voicePitch} min={0.8} max={1.5} step={0.05}
          onChange={v => updateSettings({ voicePitch: v })} />
      </div>

      {/* SOUND */}
      <SectionLabel>Sound</SectionLabel>
      <div className="bg-card rounded-btn p-4 flex items-center justify-between">
        <span className="font-body font-bold text-sm text-txt">Transition Chime</span>
        <Toggle on={settings.transitionChimeEnabled}
          onToggle={() => updateSettings({ transitionChimeEnabled: !settings.transitionChimeEnabled })} />
      </div>

      {/* DATA */}
      <SectionLabel>Data</SectionLabel>
      <button
        onTouchStart={onExportCSV} onClick={onExportCSV}
        className="bg-card rounded-btn p-4 flex items-center gap-3 w-full text-left active:bg-bg2 transition-colors"
      >
        <span className="text-xl">📤</span>
        <span className="font-body font-bold text-sm text-txt flex-1">Export as CSV</span>
      </button>
      <button
        onTouchStart={onClearData} onClick={onClearData}
        className={`rounded-btn p-4 flex items-center gap-3 w-full text-left transition-colors ${confirmClear ? 'bg-feel text-white' : 'bg-card active:bg-bg2'}`}
      >
        <span className="text-xl">🗑️</span>
        <span className={`font-body font-bold text-sm flex-1 ${confirmClear ? 'text-white' : 'text-feel'}`}>
          {confirmClear ? 'Tap again to confirm reset' : 'Clear All Data'}
        </span>
      </button>

      {/* STATS */}
      <SectionLabel>Stats</SectionLabel>
      {stats ? (
        <div className="bg-card rounded-btn p-4 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-3">
            <StatBlock label="Today" value={stats.todayTaps} />
            <StatBlock label="All-time" value={stats.total} />
            <StatBlock label="Top word" value={stats.topWord} small />
          </div>
          {stats.recent.length > 0 && (
            <>
              <div className="h-px bg-bg2" />
              <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider">Recent taps</p>
              <div className="flex flex-wrap gap-2">
                {stats.recent.map((r, i) => (
                  <span key={i} className="bg-bg2 rounded-pill px-2.5 py-1 font-body text-xs text-txt">{r.card_label}</span>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-btn p-4 flex items-center justify-center">
          <span className="font-body text-sm text-txt-l">Loading stats…</span>
        </div>
      )}

      <p className="text-center font-body text-xs text-txt-l pt-6 pb-2">Benny Talks v1.0.0</p>
    </div>
  )
}

function BrowseCardsView({ cards }) {
  const categories = ['food', 'activities', 'feelings', 'people', 'custom']
  return (
    <div className="p-4 flex flex-col gap-4">
      {categories.map(cat => {
        const catCards = cards.filter(c => c.category === cat)
        if (!catCards.length) return null
        return (
          <div key={cat}>
            <p className="font-body font-bold text-xs text-txt-l uppercase tracking-wider px-1 pb-2">
              {cat}
            </p>
            <div className="flex flex-col gap-1">
              {catCards.map(card => (
                <div key={card.id} className="bg-card rounded-btn px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="font-body font-bold text-sm text-txt flex-1">{card.label}</span>
                  {card.is_custom && (
                    <span className="font-body text-xs text-txt-l bg-bg2 rounded-pill px-2 py-0.5">custom</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PresetEditorView({ preset, cards, currentCardIds, onUpdate }) {
  const [selected, setSelected] = useState(new Set(currentCardIds))

  function toggle(cardId) {
    const next = new Set(selected)
    next.has(cardId) ? next.delete(cardId) : next.add(cardId)
    setSelected(next)
    onUpdate([...next])
  }

  return (
    <div className="p-4">
      <p className="font-body text-sm text-txt-m mb-4">Tap cards to include or exclude from <strong>{preset.label}</strong>.</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(card => {
          const on = selected.has(card.id)
          return (
            <button
              key={card.id}
              onTouchStart={() => toggle(card.id)}
              onClick={() => toggle(card.id)}
              className={`rounded-btn p-3 flex flex-col items-center gap-1 border-2 transition-colors
                ${on ? 'bg-act-l border-act' : 'bg-card border-transparent'}`}
            >
              <span className="text-2xl">{card.emoji}</span>
              <span className="font-body text-xs text-txt text-center leading-tight">{card.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StatBlock({ label, value, small }) {
  return (
    <div className="flex flex-col items-center bg-bg2 rounded-btn py-3 px-1">
      <span className={`font-display text-txt ${small ? 'text-lg' : 'text-2xl'}`}>{value}</span>
      <span className="font-body text-xs text-txt-l">{label}</span>
    </div>
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
      onTouchStart={onPress} onClick={onPress}
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
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} className="flex-1" />
      <span className="font-body text-xs text-txt-m w-8 text-right">{value.toFixed(2)}</span>
    </div>
  )
}

function Toggle({ on, onToggle }) {
  return (
    <button
      onTouchStart={onToggle} onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-food' : 'bg-bg2'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${on ? 'left-[26px]' : 'left-0.5'}`} />
    </button>
  )
}
```

**Step 1: Replace SettingsModal.jsx with the above**

Note: `PresetEditorView` uses `useState` — import it at the top of the file (already imported).

**Step 2: Verify:**
- Open settings → see 7 sections
- Add a Card works
- Browse Cards shows grouped card list
- Tap a preset → card picker grid with toggles
- Analytics: type a URL, confirm it persists after close/reopen
- Voice/Sound sliders and toggle still work
- Export CSV downloads a file
- Clear All Data: first tap shows red confirm state, second tap resets
- Stats section shows today/all-time/top word/recent taps

**Step 3: Commit**

```bash
git add src/components/settings/SettingsModal.jsx
git commit -m "feat: expand settings with 7 sections — presets editor, analytics, data, stats"
```

---

### Task 8: Wire up App.jsx final state and test full flow

**Files:**
- Modify: `src/App.jsx` (ensure all new overlay components rendered)

**Final App.jsx overlay section should look like:**

```jsx
// Overlay components (unconditional — they manage own AnimatePresence)
<TimerPicker />
<TimerDoneOverlay />
<TransitionOverlay />

// Conditional with AnimatePresence (existing pattern)
<AnimatePresence>
  {routineActive && <RoutineFlow key="routine-flow" />}
</AnimatePresence>
<AnimatePresence>
  {presetSwitcherOpen && <PresetSwitcher key="preset-switcher" />}
</AnimatePresence>
<AnimatePresence>
  {settingsOpen && <SettingsModal key="settings-modal" />}
</AnimatePresence>
```

**Step 1: Verify App.jsx has all imports and renders all 3 new overlay components**

**Step 2: Full end-to-end test:**
- [ ] Tap ⏱️ → TimerPicker opens
- [ ] Tap "30s" → timer starts, pill appears in header
- [ ] Watch pill go neutral → amber (at 12s) → red+pulse (at 6s)
- [ ] Timer completes → C5 E5 G5 C6 chime plays → celebration overlay appears
- [ ] Speech says "Time's up! Great waiting!"
- [ ] Tap Yay! → overlay closes
- [ ] Tap 🔔 → chime plays, "Time to switch!" speech, amber overlay appears
- [ ] Tap OK → overlay closes
- [ ] Open Settings → all 7 sections visible, all views work

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire all phase 2 overlay components in App.jsx"
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/lib/sounds.js` | Raise timer chime to C5 E5 G5 C6 |
| `src/components/overlay/TimerPill.jsx` | Fix thresholds: 40%/20% |
| `src/store/useStore.js` | Add timerPickerOpen, timerDoneVisible, transitionOverlayVisible, webhookUrl, new actions, showTimerDone on completion |
| `src/components/layout/Header.jsx` | Restructure: logo+preset left, ⏱️ button added right |
| `src/components/overlay/TimerPicker.jsx` | **NEW** — bottom sheet with 6 duration presets |
| `src/components/overlay/TimerDoneOverlay.jsx` | **NEW** — celebration overlay with speech |
| `src/components/overlay/TransitionOverlay.jsx` | **NEW** — amber overlay for bell/transition chime |
| `src/components/settings/SettingsModal.jsx` | **EXPANDED** — 7 sections with preset editor, stats, data export |
| `src/App.jsx` | Add imports + render new overlay components |
