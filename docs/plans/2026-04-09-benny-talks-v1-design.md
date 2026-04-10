# Benny Talks v1.0 — Design Document
Date: 2026-04-09
Status: Approved

---

## Overview

Migration of Benny Talks from a single-file HTML app (v0.6.0) to a production React/Supabase app (v1.0.0). Benny Talks is a PECS-style AAC communication app for Benicio "Benny" Ardine, age 3.5, who has Level 2 ASD. It is a real clinical tool used daily by Benny, his parents, his grandmother, and his ABA therapy team.

Primary device: iPhone 17 Pro (393px). Secondary: iPad.
Deployment: Local dev first, Cloudflare Pages later.

---

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **State:** Zustand (single store, localStorage persistence)
- **Backend:** Supabase (Postgres, Storage, Realtime)
- **Fonts:** Fredoka One (display), Nunito (body) — Google Fonts
- **No router** — single-page, tab-based navigation via Zustand

---

## Project Structure

```
src/
├── main.jsx
├── App.jsx
├── store/
│   └── useStore.js
├── lib/
│   ├── supabase.js
│   ├── speech.js
│   ├── sounds.js
│   └── defaultData.js
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── BottomNav.jsx
│   ├── cards/
│   │   ├── PecsCard.jsx
│   │   ├── CardPager.jsx
│   │   └── CardGrid.jsx
│   ├── overlay/
│   │   ├── SpeakingBar.jsx
│   │   └── TimerPill.jsx
│   ├── routines/
│   │   ├── RoutineList.jsx
│   │   ├── RoutineFlow.jsx
│   │   └── RoutineStep.jsx
│   ├── presets/
│   │   └── PresetSwitcher.jsx
│   └── settings/
│       ├── SettingsModal.jsx
│       ├── CardEditor.jsx
│       └── AddCard.jsx
└── views/
    ├── HomeView.jsx
    ├── CategoryView.jsx
    └── RoutinesView.jsx
```

---

## State Shape (Zustand)

```js
{
  // Data
  cards: Card[],
  presets: Preset[],
  presetCards: { [presetId]: CardId[] },
  routines: Routine[],
  routineSteps: { [routineId]: RoutineStep[] },

  // UI State
  activeTab: 'home' | 'food' | 'activities' | 'feelings' | 'people' | 'routines',
  activePresetId: string | null,
  speaking: { label: string, emoji: string } | null,
  settingsOpen: boolean,
  routineActive: Routine | null,
  routineStepIndex: number,

  // Timer
  timer: {
    running: boolean,
    paused: boolean,
    totalSecs: number,
    remainingSecs: number,
    label: string | null,
  },

  // Settings
  settings: {
    voiceRate: 0.80,
    voicePitch: 1.10,
    transitionChimeEnabled: true,
  },

  // Actions
  hydrate(),
  tapCard(card),
  addCard(card),
  startTimer(secs, label),
  pauseTimer(),
  cancelTimer(),
  startRoutine(routine),
  nextStep(),
  completeRoutine(),
  setActivePreset(presetId),
  updateSettings(partial),
}
```

---

## Data Flow

### App launch
1. App mounts → `hydrate()` called
2. Render immediately from localStorage (zero loading state for Benny)
3. Fetch Supabase in background → merge updates into store
4. Store persisted back to localStorage after every change

### Card tap critical path (target: < 50ms to speak)
```
touchstart → tapCard(card)
           → setState({ speaking: { label, emoji } })
           → window.speechSynthesis.speak()        ← synchronous, immediate
           → logTap(card) to Supabase              ← async, fire-and-forget
```

---

## UX/UI Design

### Cards
- Minimum touch target: 80px tall
- Emoji: ~52px, label in Fredoka One below
- 4px category color bar at card top
- touchstart fires immediately; card scales to 0.93 + category bloom
- Speaking card gets animated ring (clear feedback for Benny)
- Grid: 2×3 on iPhone, 3×2 on tablet, 4×2 iPad landscape

### Bottom Nav
- 6 tabs: Home 🏠, Food 🍗, Activities 🎯, Feelings 💛, People 👥, Routines 📋
- Always visible, 72px + safe area inset
- Active tab uses category accent color

### Header
- Left: logo + "Benny Talks" wordmark
- Center: active preset name + chevron (opens PresetSwitcher) — replaced by timer pill when timer active
- Right: transition chime bell + settings gear

### Speaking Bar
- Slides up from above bottom nav on card tap
- Large emoji + label + animated wave indicator
- Auto-dismisses after speech ends
- Overlay only — does not shift card grid layout

### Routines
- Full-screen slide-up modal — single step visible at a time
- Step emoji: ~80px, label in Fredoka One ~28px
- Timer auto-starts for timed steps — circular countdown display
- Large centered "Next" button, thumb-accessible

### Settings
- Full-screen modal, X in top-right
- Sections: Presets, Cards, Voice, Timer, Data
- Gear icon only — no long-press, no hamburger

### iPad
- Bottom nav wider with more spacing
- Card grid: 4×2 landscape, 3×3 portrait
- Routine flow centered in max-width container

---

## Technical Details

### Dependencies
```
react, react-dom, vite
tailwindcss
zustand
framer-motion
@supabase/supabase-js
```

### Tailwind Theme
CSS variables from brief mapped as Tailwind tokens: `bg-food`, `text-feel`, `border-act`, etc.

### Voice
Priority: Samantha → Nicky → Monica → Karen → Daniel → fallback
Rate: 0.80, Pitch: 1.10. Voices loaded once on init, cached in ref.

### Chimes (Web Audio API, no audio files)
- Timer chime: ascending 4-note C major arpeggio
- Transition chime: descending 2-note bell

### Touch Handling
- `onTouchStart` on cards (not onClick)
- Swipe detection on pager: raw touch events, 40px threshold
- No swipe library (would conflict with card taps)

### Supabase
- URL: https://xxjztjhkhbzardkuamll.supabase.co
- Schema applied via MCP at build start
- Default card/routine/preset data seeded after schema creation
- Anon key via `VITE_SUPABASE_ANON_KEY` env var

---

## Feature Scope (P0 — this build)

- All cards with swipeable grid
- touchstart activation
- Web Speech (voice priority list)
- Bottom nav 6 tabs
- Routine flow with step timers
- Visual timer with header pill
- Transition chime
- Preset system (4 defaults + editor)
- Add card
- Settings with X close
- Tap logging to Supabase
- localStorage offline fallback

## Out of Scope (P1+)

- Card image upload
- Voice recording per card
- Card edit modal
- Analytics dashboard
- CSV export
- Offline PWA / service worker
- Custom routine builder
- Multiple profiles
