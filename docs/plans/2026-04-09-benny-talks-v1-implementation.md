# Benny Talks v1.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Benny Talks from a single-file HTML app to a production React/Vite/Tailwind/Zustand/Supabase app with all P0 features.

**Architecture:** Zustand store as single source of truth, hydrated from Supabase on launch and persisted to localStorage for offline-by-default behavior. All card taps are synchronous local state; Supabase writes are async fire-and-forget. No router — tab navigation via Zustand.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Zustand, Framer Motion, @supabase/supabase-js, Web Speech API, Web Audio API.

---

## Phase 1: Project Scaffold

### Task 1: Scaffold Vite + React project

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`

**Step 1: Scaffold with Vite**

Run from `C:/Projects/benny-talks`:
```bash
npm create vite@latest . -- --template react
```
When prompted "Current directory is not empty" — select "Ignore files and continue".

**Step 2: Install dependencies**

```bash
npm install
npm install zustand framer-motion @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Step 3: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server running at http://localhost:5173

**Step 4: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Vite + React project"
```

---

### Task 2: Apply Supabase schema

**Files:**
- Create: `supabase/schema.sql`

**Step 1: Save schema file**

Create `supabase/schema.sql` with the following content:

```sql
create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  emoji text not null default '⭐',
  category text not null,
  img_url text,
  audio_url text,
  reward_audio_url text,
  is_custom boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists presets (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default '⭐',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists preset_cards (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid references presets(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  sort_order int default 0,
  unique(preset_id, card_id)
);

create table if not exists tap_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  card_id uuid references cards(id) on delete set null,
  card_label text,
  card_emoji text,
  category text,
  is_custom boolean default false,
  routine_name text,
  steps_completed int,
  total_steps int,
  duration_secs int,
  completed boolean,
  context text,
  preset_id uuid references presets(id) on delete set null,
  preset_label text,
  created_at timestamptz default now()
);

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  emoji text not null,
  intro_text text,
  sort_order int default 0,
  is_system boolean default true,
  created_at timestamptz default now()
);

create table if not exists routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references routines(id) on delete cascade,
  emoji text not null,
  label text not null,
  sub_label text,
  timer_secs int,
  sort_order int default 0
);
```

**Step 2: Apply schema via Supabase MCP**

Use the Supabase MCP `execute_sql` tool with project ref `xxjztjhkhbzardkuamll` to run the SQL above.

**Step 3: Verify tables exist**

Use Supabase MCP `list_tables` tool to confirm all 6 tables are present:
`cards`, `presets`, `preset_cards`, `tap_log`, `routines`, `routine_steps`

**Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase schema"
```

---

### Task 3: Tailwind theme + design system

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`

**Step 1: Update tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FDF6EE',
        bg2: '#F5EDE0',
        card: '#FFFFFF',
        food: { DEFAULT: '#2A9D8F', l: '#E8F7F5', m: '#B2E4DF' },
        act:  { DEFAULT: '#E07C24', l: '#FEF3E8', m: '#FAD5AD' },
        feel: { DEFAULT: '#E05C7A', l: '#FDEDF1', m: '#F5B8C8' },
        ppl:  { DEFAULT: '#3A7DC9', l: '#EAF2FC', m: '#AECFEF' },
        rtn:  { DEFAULT: '#7B61D6', l: '#F0ECFD', m: '#C9BEED' },
        cust: { DEFAULT: '#D4A017', l: '#FDF6E3', m: '#F5DFA0' },
        txt:  { DEFAULT: '#2D2416', m: '#7A6A56', l: '#B5A08A' },
      },
      fontFamily: {
        display: ['"Fredoka One"', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        pill: '50px',
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)',
        btn: '0 2px 8px rgba(0,0,0,0.08)',
        modal: '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
}
```

**Step 2: Update src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  html, body, #root {
    height: 100%;
    overflow: hidden;
    background: #FDF6EE;
    font-family: 'Nunito', sans-serif;
    color: #2D2416;
    user-select: none;
    -webkit-user-select: none;
  }
}
```

**Step 3: Add Google Fonts to index.html**

Add inside `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Benny Talks">
```

**Step 4: Verify fonts load in browser**

```bash
npm run dev
```
Inspect the page — Fredoka One and Nunito should be visible in the network tab.

**Step 5: Commit**

```bash
git add tailwind.config.js src/index.css index.html
git commit -m "feat: add design system — Tailwind theme, fonts, CSS base"
```

---

## Phase 2: Core Infrastructure

### Task 4: Supabase client + environment variables

**Files:**
- Create: `.env.local`
- Create: `src/lib/supabase.js`
- Create: `.gitignore` entry for `.env.local`

**Step 1: Create .env.local**

```
VITE_SUPABASE_URL=https://xxjztjhkhbzardkuamll.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_MpL1OFU26fSFpv_vEy8Kzw_wE8LK0g7
```

**Step 2: Create src/lib/supabase.js**

```js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

**Step 3: Ensure .env.local is gitignored**

Add to `.gitignore`:
```
.env.local
.env*.local
```

**Step 4: Verify connection**

In `src/App.jsx` temporarily add:
```js
import { supabase } from './lib/supabase'
console.log('Supabase client:', supabase)
```
Check browser console — should show the Supabase client object, no errors.
Remove the console.log after verifying.

**Step 5: Commit**

```bash
git add src/lib/supabase.js .gitignore
git commit -m "feat: add Supabase client"
```

---

### Task 5: Default data

**Files:**
- Create: `src/lib/defaultData.js`

**Step 1: Create src/lib/defaultData.js**

```js
// All default cards, routines, preset definitions for Benny Talks
// IDs are stable strings — used to seed Supabase and match preset_cards

export const DEFAULT_CARDS = [
  // Food (13)
  { id: 'food-nuggets',     label: 'Chicken Nuggets', emoji: '🍗', category: 'food',       sort_order: 0 },
  { id: 'food-pizza',       label: 'Pizza',           emoji: '🍕', category: 'food',       sort_order: 1 },
  { id: 'food-fries',       label: 'French Fries',    emoji: '🍟', category: 'food',       sort_order: 2 },
  { id: 'food-ranch',       label: 'Ranch',           emoji: '🥣', category: 'food',       sort_order: 3 },
  { id: 'food-toast',       label: 'Toast Sticks',    emoji: '🍞', category: 'food',       sort_order: 4 },
  { id: 'food-juice',       label: 'Green Juice',     emoji: '🥤', category: 'food',       sort_order: 5 },
  { id: 'food-water',       label: 'Water',           emoji: '💧', category: 'food',       sort_order: 6 },
  { id: 'food-blueberries', label: 'Blueberries',     emoji: '🫐', category: 'food',       sort_order: 7 },
  { id: 'food-strawberries',label: 'Strawberries',    emoji: '🍓', category: 'food',       sort_order: 8 },
  { id: 'food-banana',      label: 'Banana',          emoji: '🍌', category: 'food',       sort_order: 9 },
  { id: 'food-figbars',     label: 'Fig Bars',        emoji: '🍪', category: 'food',       sort_order: 10 },
  { id: 'food-milk',        label: 'Milk',            emoji: '🥛', category: 'food',       sort_order: 11 },
  { id: 'food-crackers',    label: 'Crackers',        emoji: '🍘', category: 'food',       sort_order: 12 },

  // Activities (16)
  { id: 'act-tractor',      label: 'Tractor',         emoji: '🚜', category: 'activities', sort_order: 0 },
  { id: 'act-trampoline',   label: 'Trampoline',      emoji: '🤸', category: 'activities', sort_order: 1 },
  { id: 'act-hotwheels',    label: 'Hot Wheels',      emoji: '🏎️', category: 'activities', sort_order: 2 },
  { id: 'act-carride',      label: 'Car Ride',        emoji: '🚗', category: 'activities', sort_order: 3 },
  { id: 'act-blippi',       label: 'Blippi',          emoji: '🎉', category: 'activities', sort_order: 4 },
  { id: 'act-dream',        label: 'Dream Machine',   emoji: '📖', category: 'activities', sort_order: 5 },
  { id: 'act-tonies',       label: 'Tonies',          emoji: '🎵', category: 'activities', sort_order: 6 },
  { id: 'act-guitar',       label: 'Guitar',          emoji: '🎸', category: 'activities', sort_order: 7 },
  { id: 'act-drums',        label: 'Drums',           emoji: '🥁', category: 'activities', sort_order: 8 },
  { id: 'act-park',         label: 'Park',            emoji: '🌳', category: 'activities', sort_order: 9 },
  { id: 'act-garden',       label: 'Garden',          emoji: '🌱', category: 'activities', sort_order: 10 },
  { id: 'act-glammy',       label: "Glammy's House",  emoji: '👵', category: 'activities', sort_order: 11 },
  { id: 'act-youtube',      label: 'YouTube',         emoji: '▶️', category: 'activities', sort_order: 12 },
  { id: 'act-swing',        label: 'Swing',           emoji: '🪁', category: 'activities', sort_order: 13 },
  { id: 'act-waterplay',    label: 'Water Play',      emoji: '💦', category: 'activities', sort_order: 14 },
  { id: 'act-ducks',        label: 'See Ducks',       emoji: '🦆', category: 'activities', sort_order: 15 },

  // Feelings (14)
  { id: 'feel-happy',    label: 'Happy',    emoji: '😄', category: 'feelings', sort_order: 0 },
  { id: 'feel-no',       label: 'No',       emoji: '🙅', category: 'feelings', sort_order: 1 },
  { id: 'feel-yes',      label: 'Yes',      emoji: '👍', category: 'feelings', sort_order: 2 },
  { id: 'feel-alldone',  label: 'All Done', emoji: '✅', category: 'feelings', sort_order: 3 },
  { id: 'feel-more',     label: 'More',     emoji: '🙌', category: 'feelings', sort_order: 4 },
  { id: 'feel-help',     label: 'Help',     emoji: '🤝', category: 'feelings', sort_order: 5 },
  { id: 'feel-wait',     label: 'Wait',     emoji: '✋', category: 'feelings', sort_order: 6 },
  { id: 'feel-stop',     label: 'Stop',     emoji: '🛑', category: 'feelings', sort_order: 7 },
  { id: 'feel-tired',    label: 'Tired',    emoji: '😴', category: 'feelings', sort_order: 8 },
  { id: 'feel-mad',      label: 'Mad',      emoji: '😠', category: 'feelings', sort_order: 9 },
  { id: 'feel-scared',   label: 'Scared',   emoji: '😨', category: 'feelings', sort_order: 10 },
  { id: 'feel-hurt',     label: 'Hurt',     emoji: '🤕', category: 'feelings', sort_order: 11 },
  { id: 'feel-hungry',   label: 'Hungry',   emoji: '🍽️', category: 'feelings', sort_order: 12 },
  { id: 'feel-iwant',    label: 'I Want',   emoji: '🫳', category: 'feelings', sort_order: 13 },

  // People (8)
  { id: 'ppl-mom',       label: 'Mom',      emoji: '👩',  category: 'people', sort_order: 0 },
  { id: 'ppl-dad',       label: 'Dad',      emoji: '👨',  category: 'people', sort_order: 1 },
  { id: 'ppl-glammy',    label: 'Glammy',   emoji: '👵',  category: 'people', sort_order: 2 },
  { id: 'ppl-willow',    label: 'Willow',   emoji: '🐕',  category: 'people', sort_order: 3 },
  { id: 'ppl-frida',     label: 'Frida',    emoji: '🐶',  category: 'people', sort_order: 4 },
  { id: 'ppl-heather',   label: 'Heather',  emoji: '👩‍🦰', category: 'people', sort_order: 5 },
  { id: 'ppl-cassie',    label: 'Cassie',   emoji: '👩‍🦱', category: 'people', sort_order: 6 },
  { id: 'ppl-angelique', label: 'Angelique',emoji: '👩‍💼', category: 'people', sort_order: 7 },
]

export const DEFAULT_ROUTINES = [
  { id: 'rtn-potty',    label: 'Potty Time',    emoji: '🚽', sort_order: 0, intro_text: "Let's use the potty!" },
  { id: 'rtn-hands',    label: 'Wash Hands',    emoji: '🧼', sort_order: 1, intro_text: 'Time to wash our hands!' },
  { id: 'rtn-diaper',   label: 'Diaper Change', emoji: '👶', sort_order: 2, intro_text: "Time for a clean diaper!" },
  { id: 'rtn-bath',     label: 'Bath Time',     emoji: '🛁', sort_order: 3, intro_text: "Bath time!" },
  { id: 'rtn-shoes',    label: 'Shoes On',      emoji: '👟', sort_order: 4, intro_text: "Let's put our shoes on!" },
  { id: 'rtn-dressed',  label: 'Get Dressed',   emoji: '👕', sort_order: 5, intro_text: "Time to get dressed!" },
  { id: 'rtn-cleanup',  label: 'Clean Up',      emoji: '🧹', sort_order: 6, intro_text: "Let's clean up!" },
  { id: 'rtn-nap',      label: 'Nap Time',      emoji: '😴', sort_order: 7, intro_text: "Time for a nap." },
  { id: 'rtn-bed',      label: 'Bedtime',       emoji: '🌙', sort_order: 8, intro_text: "Time for bed!" },
]

export const DEFAULT_ROUTINE_STEPS = {
  'rtn-potty': [
    { emoji: '🚶', label: 'Walk to bathroom',    sort_order: 0 },
    { emoji: '👇', label: 'Pull down pullup',     sort_order: 1 },
    { emoji: '🚽', label: 'Sit on toilet',        sort_order: 2, timer_secs: 300 },
    { emoji: '🧻', label: 'Wipe and flush',       sort_order: 3 },
    { emoji: '👆', label: 'Pull up pullup',       sort_order: 4 },
    { emoji: '🧼', label: 'Wash hands',           sort_order: 5 },
  ],
  'rtn-hands': [
    { emoji: '🚿', label: 'Turn on water',        sort_order: 0 },
    { emoji: '💧', label: 'Wet hands',            sort_order: 1 },
    { emoji: '🧴', label: 'Add soap',             sort_order: 2 },
    { emoji: '🤲', label: 'Scrub',                sort_order: 3, timer_secs: 20 },
    { emoji: '💦', label: 'Rinse',                sort_order: 4 },
    { emoji: '🏳️', label: 'Dry',                 sort_order: 5 },
  ],
  'rtn-diaper': [
    { emoji: '🛏️', label: 'Lie down',            sort_order: 0 },
    { emoji: '👇', label: 'Pullup off',            sort_order: 1 },
    { emoji: '🧻', label: 'Clean up',             sort_order: 2 },
    { emoji: '✨', label: 'New pullup on',        sort_order: 3 },
    { emoji: '🧼', label: 'Wash hands',           sort_order: 4 },
  ],
  'rtn-bath': [
    { emoji: '👕', label: 'Take off clothes',     sort_order: 0 },
    { emoji: '🛁', label: 'Get in tub',           sort_order: 1 },
    { emoji: '💆', label: 'Wash hair',            sort_order: 2 },
    { emoji: '🧼', label: 'Wash body',            sort_order: 3 },
    { emoji: '💦', label: 'Rinse',               sort_order: 4 },
    { emoji: '🏳️', label: 'Dry',                sort_order: 5 },
    { emoji: '👕', label: 'Get dressed',          sort_order: 6 },
  ],
  'rtn-shoes': [
    { emoji: '🪑', label: 'Sit down',            sort_order: 0 },
    { emoji: '👟', label: 'First shoe',           sort_order: 1 },
    { emoji: '🦶', label: 'Foot in',             sort_order: 2 },
    { emoji: '👟', label: 'Second shoe',          sort_order: 3 },
    { emoji: '🦶', label: 'Other foot',           sort_order: 4 },
    { emoji: '🧍', label: 'Stand up',            sort_order: 5 },
  ],
  'rtn-dressed': [
    { emoji: '🩲', label: 'Underwear',           sort_order: 0 },
    { emoji: '👕', label: 'Shirt',               sort_order: 1 },
    { emoji: '👖', label: 'Pants',               sort_order: 2 },
    { emoji: '🧦', label: 'Socks',               sort_order: 3 },
    { emoji: '👟', label: 'Shoes',               sort_order: 4 },
  ],
  'rtn-cleanup': [
    { emoji: '👀', label: 'Look at mess',        sort_order: 0 },
    { emoji: '🧸', label: 'Pick up toys',        sort_order: 1 },
    { emoji: '📚', label: 'Stack books',         sort_order: 2 },
    { emoji: '✅', label: 'All done!',           sort_order: 3 },
  ],
  'rtn-nap': [
    { emoji: '🚽', label: 'Try potty',           sort_order: 0 },
    { emoji: '🛏️', label: 'Lie down',            sort_order: 1 },
    { emoji: '🧸', label: 'Grab comfort item',   sort_order: 2 },
    { emoji: '😴', label: 'Close eyes',          sort_order: 3 },
  ],
  'rtn-bed': [
    { emoji: '🚽', label: 'Use potty',           sort_order: 0 },
    { emoji: '🪥', label: 'Brush teeth',         sort_order: 1, timer_secs: 60 },
    { emoji: '🌙', label: 'Pajamas',             sort_order: 2 },
    { emoji: '📖', label: 'Story time',          sort_order: 3 },
    { emoji: '💡', label: 'Lights out',          sort_order: 4 },
  ],
}

export const DEFAULT_PRESETS = [
  { id: 'preset-aba',    label: 'ABA Class',       icon: '🏫', sort_order: 0 },
  { id: 'preset-home',   label: 'Home',             icon: '🏠', sort_order: 1 },
  { id: 'preset-glammy', label: "Glammy's House",   icon: '👵', sort_order: 2 },
  { id: 'preset-out',    label: 'Out and About',    icon: '🌎', sort_order: 3 },
]

export const DEFAULT_PRESET_CARDS = {
  'preset-aba':    ['feel-more','feel-alldone','feel-help','feel-wait','feel-no','feel-yes','feel-iwant','food-water','act-tractor','act-hotwheels','ppl-heather','ppl-cassie'],
  'preset-home':   ['act-tractor','food-nuggets','food-water','act-trampoline','act-hotwheels','act-blippi','feel-more','feel-alldone','ppl-mom','ppl-dad','food-fries','act-guitar'],
  'preset-glammy': ['ppl-glammy','act-garden','food-nuggets','food-banana','act-tractor','feel-happy','feel-more','feel-alldone','food-water','act-youtube','ppl-mom','ppl-dad'],
  'preset-out':    ['feel-help','feel-wait','feel-no','food-water','food-nuggets','feel-alldone','act-carride','act-park','feel-hungry','feel-tired','ppl-mom','ppl-dad'],
}
```

**Step 2: Commit**

```bash
git add src/lib/defaultData.js
git commit -m "feat: add default card, routine, and preset data"
```

---

### Task 6: Speech + sounds utilities

**Files:**
- Create: `src/lib/speech.js`
- Create: `src/lib/sounds.js`

**Step 1: Create src/lib/speech.js**

```js
// Voice priority for iOS/macOS: Samantha > Nicky > Monica > Karen > Daniel > fallback
const VOICE_PRIORITY = ['Samantha', 'Nicky', 'Monica', 'Karen', 'Daniel', 'Moira']

let selectedVoice = null

function loadVoice() {
  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return
  for (const name of VOICE_PRIORITY) {
    const match = voices.find(v => v.name === name)
    if (match) { selectedVoice = match; return }
  }
  selectedVoice = voices[0] ?? null
}

// Voices load asynchronously on some browsers
if (typeof window !== 'undefined') {
  loadVoice()
  window.speechSynthesis.onvoiceschanged = loadVoice
}

export function speak(text, { rate = 0.80, pitch = 1.10 } = {}) {
  if (!window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  if (selectedVoice) utt.voice = selectedVoice
  utt.rate = rate
  utt.pitch = pitch
  window.speechSynthesis.speak(utt)
  return utt
}
```

**Step 2: Create src/lib/sounds.js**

```js
// Synthesized chimes via Web Audio API — no audio files needed
let ctx = null

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

function playNote(freq, startTime, duration, gainVal = 0.3) {
  const ac = getCtx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.frequency.value = freq
  osc.type = 'sine'
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

// Ascending 4-note C major arpeggio — timer done
export function playTimerChime() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [261.63, 329.63, 392.00, 523.25] // C4 E4 G4 C5
  notes.forEach((freq, i) => playNote(freq, t + i * 0.18, 0.5))
}

// Descending 2-note bell — transition chime
export function playTransitionChime() {
  const ac = getCtx()
  const t = ac.currentTime
  playNote(523.25, t, 0.6)       // C5
  playNote(392.00, t + 0.25, 0.8) // G4
}
```

**Step 3: Commit**

```bash
git add src/lib/speech.js src/lib/sounds.js
git commit -m "feat: add speech and audio chime utilities"
```

---

### Task 7: Zustand store

**Files:**
- Create: `src/store/useStore.js`

**Step 1: Create src/store/useStore.js**

```js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { speak } from '../lib/speech'
import { playTimerChime } from '../lib/sounds'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from '../lib/defaultData'

const TABS = ['home', 'food', 'activities', 'feelings', 'people', 'routines']

export const useStore = create(
  persist(
    (set, get) => ({
      // ── DATA ──
      cards: DEFAULT_CARDS,
      presets: DEFAULT_PRESETS,
      presetCards: DEFAULT_PRESET_CARDS,
      routines: DEFAULT_ROUTINES,
      routineSteps: DEFAULT_ROUTINE_STEPS,

      // ── UI ──
      activeTab: 'home',
      activePresetId: 'preset-home',
      speaking: null,
      settingsOpen: false,
      presetSwitcherOpen: false,

      // ── ROUTINE ──
      routineActive: null,
      routineStepIndex: 0,

      // ── TIMER ──
      timer: {
        running: false,
        paused: false,
        totalSecs: 0,
        remainingSecs: 0,
        label: null,
        intervalId: null,
      },

      // ── SETTINGS ──
      settings: {
        voiceRate: 0.80,
        voicePitch: 1.10,
        transitionChimeEnabled: true,
      },

      // ── ACTIONS ──

      setActiveTab: (tab) => set({ activeTab: tab }),

      tapCard: (card) => {
        const { settings } = get()
        speak(card.label, { rate: settings.voiceRate, pitch: settings.voicePitch })
        set({ speaking: { label: card.label, emoji: card.emoji } })
        setTimeout(() => set({ speaking: null }), 2800)

        // Fire-and-forget tap log
        supabase.from('tap_log').insert({
          event_type: 'card_tap',
          card_id: card.id,
          card_label: card.label,
          card_emoji: card.emoji,
          category: card.category,
          is_custom: card.is_custom ?? false,
          preset_id: get().activePresetId,
          preset_label: get().presets.find(p => p.id === get().activePresetId)?.label ?? null,
        }).then(() => {})
      },

      setSpeaking: (speaking) => set({ speaking }),

      setActivePreset: (presetId) => set({ activePresetId: presetId, presetSwitcherOpen: false }),

      openPresetSwitcher: () => set({ presetSwitcherOpen: true }),
      closePresetSwitcher: () => set({ presetSwitcherOpen: false }),

      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),

      updateSettings: (partial) => set(s => ({ settings: { ...s.settings, ...partial } })),

      addCard: async (cardData) => {
        const card = {
          ...cardData,
          is_custom: true,
          sort_order: get().cards.filter(c => c.category === cardData.category).length,
        }
        const { data, error } = await supabase.from('cards').insert(card).select().single()
        if (!error && data) {
          set(s => ({ cards: [...s.cards, data] }))
        }
      },

      // ── TIMER ──

      startTimer: (secs, label = null) => {
        const { timer } = get()
        if (timer.intervalId) clearInterval(timer.intervalId)

        const intervalId = setInterval(() => {
          const { timer } = get()
          if (timer.paused) return
          if (timer.remainingSecs <= 1) {
            clearInterval(timer.intervalId)
            playTimerChime()
            set({ timer: { running: false, paused: false, totalSecs: 0, remainingSecs: 0, label: null, intervalId: null } })
            return
          }
          set(s => ({ timer: { ...s.timer, remainingSecs: s.timer.remainingSecs - 1 } }))
        }, 1000)

        set({ timer: { running: true, paused: false, totalSecs: secs, remainingSecs: secs, label, intervalId } })
      },

      pauseTimer: () => set(s => ({ timer: { ...s.timer, paused: !s.timer.paused } })),

      cancelTimer: () => {
        const { timer } = get()
        if (timer.intervalId) clearInterval(timer.intervalId)
        set({ timer: { running: false, paused: false, totalSecs: 0, remainingSecs: 0, label: null, intervalId: null } })
      },

      // ── ROUTINES ──

      startRoutine: (routine) => {
        set({ routineActive: routine, routineStepIndex: 0 })
      },

      nextStep: () => {
        const { routineActive, routineStepIndex, routineSteps, cancelTimer } = get()
        if (!routineActive) return
        const steps = routineSteps[routineActive.id] ?? []
        get().cancelTimer()
        if (routineStepIndex >= steps.length - 1) {
          get().completeRoutine()
        } else {
          set(s => ({ routineStepIndex: s.routineStepIndex + 1 }))
        }
      },

      completeRoutine: () => {
        const { routineActive } = get()
        supabase.from('tap_log').insert({
          event_type: 'routine_complete',
          routine_name: routineActive?.label ?? null,
        }).then(() => {})
        set({ routineActive: null, routineStepIndex: 0 })
      },

      closeRoutine: () => {
        get().cancelTimer()
        set({ routineActive: null, routineStepIndex: 0 })
      },

      // ── HYDRATE (background Supabase sync) ──

      hydrate: async () => {
        const [cardsRes, routinesRes, stepsRes, presetsRes, presetCardsRes] = await Promise.all([
          supabase.from('cards').select('*').order('sort_order'),
          supabase.from('routines').select('*').order('sort_order'),
          supabase.from('routine_steps').select('*').order('sort_order'),
          supabase.from('presets').select('*').order('sort_order'),
          supabase.from('preset_cards').select('*').order('sort_order'),
        ])

        const updates = {}
        if (cardsRes.data?.length)    updates.cards = cardsRes.data
        if (routinesRes.data?.length) updates.routines = routinesRes.data
        if (stepsRes.data?.length) {
          const stepMap = {}
          stepsRes.data.forEach(s => {
            if (!stepMap[s.routine_id]) stepMap[s.routine_id] = []
            stepMap[s.routine_id].push(s)
          })
          updates.routineSteps = stepMap
        }
        if (presetsRes.data?.length) updates.presets = presetsRes.data
        if (presetCardsRes.data?.length) {
          const pcMap = {}
          presetCardsRes.data.forEach(pc => {
            if (!pcMap[pc.preset_id]) pcMap[pc.preset_id] = []
            pcMap[pc.preset_id].push(pc.card_id)
          })
          updates.presetCards = pcMap
        }

        if (Object.keys(updates).length) set(updates)
      },
    }),
    {
      name: 'benny-talks-store',
      // Don't persist timer interval IDs or open modal state
      partialize: (s) => ({
        cards: s.cards,
        presets: s.presets,
        presetCards: s.presetCards,
        routines: s.routines,
        routineSteps: s.routineSteps,
        activePresetId: s.activePresetId,
        settings: s.settings,
      }),
    }
  )
)
```

**Step 2: Commit**

```bash
git add src/store/useStore.js
git commit -m "feat: add Zustand store with full state and actions"
```

---

## Phase 3: App Shell

### Task 8: App.jsx shell + seed trigger

**Files:**
- Modify: `src/App.jsx`
- Create: `src/lib/seed.js`

**Step 1: Create src/lib/seed.js**

This seeds the Supabase DB with default data on first run (checks if cards table is empty first):

```js
import { supabase } from './supabase'
import { DEFAULT_CARDS, DEFAULT_ROUTINES, DEFAULT_ROUTINE_STEPS, DEFAULT_PRESETS, DEFAULT_PRESET_CARDS } from './defaultData'

export async function seedIfEmpty() {
  const { count } = await supabase.from('cards').select('*', { count: 'exact', head: true })
  if (count > 0) return // already seeded

  // Insert cards
  await supabase.from('cards').insert(DEFAULT_CARDS)

  // Insert routines
  await supabase.from('routines').insert(DEFAULT_ROUTINES)

  // Insert routine steps (flatten from map)
  const allSteps = Object.entries(DEFAULT_ROUTINE_STEPS).flatMap(([routineId, steps]) =>
    steps.map(s => ({ ...s, routine_id: routineId }))
  )
  await supabase.from('routine_steps').insert(allSteps)

  // Insert presets
  await supabase.from('presets').insert(DEFAULT_PRESETS)

  // Insert preset_cards
  const allPresetCards = Object.entries(DEFAULT_PRESET_CARDS).flatMap(([presetId, cardIds]) =>
    cardIds.map((cardId, i) => ({ preset_id: presetId, card_id: cardId, sort_order: i }))
  )
  await supabase.from('preset_cards').insert(allPresetCards)
}
```

**Step 2: Update src/App.jsx**

```jsx
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { seedIfEmpty } from './lib/seed'
import Header from './components/layout/Header'
import BottomNav from './components/layout/BottomNav'
import HomeView from './views/HomeView'
import CategoryView from './views/CategoryView'
import RoutinesView from './views/RoutinesView'
import SpeakingBar from './components/overlay/SpeakingBar'
import RoutineFlow from './components/routines/RoutineFlow'
import PresetSwitcher from './components/presets/PresetSwitcher'
import SettingsModal from './components/settings/SettingsModal'

export default function App() {
  const { activeTab, routineActive, settingsOpen, presetSwitcherOpen, hydrate } = useStore()

  useEffect(() => {
    seedIfEmpty().then(() => hydrate())
  }, [])

  return (
    <div className="h-full flex flex-col max-w-[600px] mx-auto relative overflow-hidden bg-bg">
      <Header />

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'home'       && <HomeView />}
        {activeTab === 'food'       && <CategoryView category="food" />}
        {activeTab === 'activities' && <CategoryView category="activities" />}
        {activeTab === 'feelings'   && <CategoryView category="feelings" />}
        {activeTab === 'people'     && <CategoryView category="people" />}
        {activeTab === 'routines'   && <RoutinesView />}
      </main>

      <SpeakingBar />
      <BottomNav />

      {routineActive    && <RoutineFlow />}
      {presetSwitcherOpen && <PresetSwitcher />}
      {settingsOpen     && <SettingsModal />}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/App.jsx src/lib/seed.js
git commit -m "feat: add App shell with view routing and seed logic"
```

---

## Phase 4: Layout Components

### Task 9: BottomNav

**Files:**
- Create: `src/components/layout/BottomNav.jsx`

**Step 1: Create src/components/layout/BottomNav.jsx**

```jsx
import { useStore } from '../../store/useStore'

const TABS = [
  { id: 'home',       label: 'Home',       emoji: '🏠' },
  { id: 'food',       label: 'Food',       emoji: '🍗' },
  { id: 'activities', label: 'Play',       emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛' },
  { id: 'people',     label: 'People',     emoji: '👥' },
  { id: 'routines',   label: 'Routines',   emoji: '📋' },
]

const CATEGORY_ACTIVE = {
  home:       'text-act border-act',
  food:       'text-food border-food',
  activities: 'text-act border-act',
  feelings:   'text-feel border-feel',
  people:     'text-ppl border-ppl',
  routines:   'text-rtn border-rtn',
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
            <span className="text-xl leading-none">{tab.emoji}</span>
            <span className={`text-[10px] font-body font-700 leading-none ${isActive ? '' : 'text-txt-m'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/layout/BottomNav.jsx
git commit -m "feat: add BottomNav with 6 tabs"
```

---

### Task 10: Header

**Files:**
- Create: `src/components/layout/Header.jsx`
- Create: `src/components/overlay/TimerPill.jsx`

**Step 1: Create src/components/overlay/TimerPill.jsx**

```jsx
import { useStore } from '../../store/useStore'

function formatTime(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

export default function TimerPill() {
  const { timer, pauseTimer } = useStore()
  if (!timer.running) return null

  const pct = timer.totalSecs > 0 ? timer.remainingSecs / timer.totalSecs : 0
  const colorClass = pct > 0.5 ? 'border-food text-food'
    : pct > 0.2 ? 'border-act text-act'
    : 'border-feel text-feel animate-pulse'

  return (
    <button
      onTouchStart={pauseTimer}
      onClick={pauseTimer}
      className={`flex items-center gap-1.5 bg-card rounded-pill px-3 py-1.5 shadow-btn border-2 ${colorClass}`}
    >
      <span className="text-sm">{timer.paused ? '⏸️' : '⏱️'}</span>
      <span className="font-display text-lg min-w-[44px] text-center">
        {formatTime(timer.remainingSecs)}
      </span>
    </button>
  )
}
```

**Step 2: Create src/components/layout/Header.jsx**

```jsx
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
            <span className="font-body font-700 text-sm text-txt">{activePreset?.label ?? 'All Cards'}</span>
            <span className="text-txt-l text-xs">›</span>
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
```

**Step 3: Commit**

```bash
git add src/components/layout/Header.jsx src/components/overlay/TimerPill.jsx
git commit -m "feat: add Header with preset switcher and timer pill"
```

---

## Phase 5: Card System

### Task 11: PecsCard

**Files:**
- Create: `src/components/cards/PecsCard.jsx`

**Step 1: Create src/components/cards/PecsCard.jsx**

```jsx
import { useState } from 'react'
import { useStore } from '../../store/useStore'

const CATEGORY_STYLES = {
  food:       { bar: 'bg-food',  bloom: 'bg-food-l'  },
  activities: { bar: 'bg-act',   bloom: 'bg-act-l'   },
  feelings:   { bar: 'bg-feel',  bloom: 'bg-feel-l'  },
  people:     { bar: 'bg-ppl',   bloom: 'bg-ppl-l'   },
  routines:   { bar: 'bg-rtn',   bloom: 'bg-rtn-l'   },
  custom:     { bar: 'bg-cust',  bloom: 'bg-cust-l'  },
}

export default function PecsCard({ card }) {
  const { tapCard, speaking } = useStore()
  const [pressing, setPressing] = useState(false)
  const [blooming, setBlooming] = useState(false)

  const styles = CATEGORY_STYLES[card.category] ?? CATEGORY_STYLES.custom
  const isActive = speaking?.label === card.label

  function handleTouchStart(e) {
    e.preventDefault()
    setPressing(true)
    setBlooming(true)
    tapCard(card)
    setTimeout(() => setPressing(false), 150)
    setTimeout(() => setBlooming(false), 400)
  }

  return (
    <button
      onTouchStart={handleTouchStart}
      onClick={() => tapCard(card)} // fallback for desktop
      className={`
        relative overflow-hidden rounded-card bg-card shadow-card border-none
        flex flex-col items-center justify-center gap-2 p-3
        transition-transform duration-150
        ${pressing ? 'scale-[0.93]' : 'scale-100'}
        ${isActive ? 'ring-2 ring-offset-1 ring-txt-m' : ''}
        min-h-[80px]
      `}
    >
      {/* Category bar */}
      <div className={`absolute top-0 inset-x-0 h-1 ${styles.bar}`} />

      {/* Bloom overlay */}
      <div className={`absolute inset-0 rounded-card transition-opacity duration-300 ${styles.bloom} ${blooming ? 'opacity-100' : 'opacity-0'}`} />

      {/* Content */}
      <span className="relative text-[52px] leading-none">{card.emoji}</span>
      <span className="relative font-display text-sm text-center text-txt leading-tight px-1 line-clamp-2">
        {card.label}
      </span>
    </button>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/cards/PecsCard.jsx
git commit -m "feat: add PecsCard with touchstart, bloom, and category styling"
```

---

### Task 12: CardPager + CardGrid

**Files:**
- Create: `src/components/cards/CardGrid.jsx`
- Create: `src/components/cards/CardPager.jsx`

**Step 1: Create src/components/cards/CardGrid.jsx**

```jsx
import PecsCard from './PecsCard'

export default function CardGrid({ cards }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 h-full">
      {cards.map(card => (
        <PecsCard key={card.id} card={card} />
      ))}
    </div>
  )
}
```

**Step 2: Create src/components/cards/CardPager.jsx**

```jsx
import { useState, useRef } from 'react'
import CardGrid from './CardGrid'

// iPhone: 2×3 = 6 cards/page. Tablet: 3×2 = 6 cards/page.
// We use 6 per page for both and let CSS handle the grid columns.
const CARDS_PER_PAGE = 6

export default function CardPager({ cards }) {
  const [page, setPage] = useState(0)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const pages = []
  for (let i = 0; i < cards.length; i += CARDS_PER_PAGE) {
    pages.push(cards.slice(i, i + CARDS_PER_PAGE))
  }
  const totalPages = pages.length

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Only swipe if horizontal movement dominates
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0 && page < totalPages - 1) setPage(p => p + 1)
      if (dx > 0 && page > 0) setPage(p => p - 1)
    }
    touchStartX.current = null
    touchStartY.current = null
  }

  if (!cards.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-txt-l font-body text-sm">
        No cards here yet
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-3">
      <div
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ transform: `translateX(${-page * 100}%)`, width: `${totalPages * 100}%` }}
        >
          {pages.map((pageCards, i) => (
            <div key={i} className="h-full p-1" style={{ width: `${100 / totalPages}%` }}>
              <CardGrid cards={pageCards} />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 py-2 flex-shrink-0">
          {pages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 bg-txt-l
                ${i === page ? 'w-4 bg-txt-m' : 'w-1.5'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/cards/CardGrid.jsx src/components/cards/CardPager.jsx
git commit -m "feat: add CardGrid and CardPager with swipe + dot indicators"
```

---

### Task 13: CategoryView + HomeView

**Files:**
- Create: `src/views/CategoryView.jsx`
- Create: `src/views/HomeView.jsx`

**Step 1: Create src/views/CategoryView.jsx**

```jsx
import { useStore } from '../store/useStore'
import CardPager from '../components/cards/CardPager'

const CATEGORY_LABELS = {
  food: 'Food',
  activities: 'Activities',
  feelings: 'Feelings',
  people: 'People',
}

export default function CategoryView({ category }) {
  const { cards, presetCards, activePresetId } = useStore()

  // If preset active, filter to preset card IDs for this category; else show all
  const presetCardIds = activePresetId ? (presetCards[activePresetId] ?? []) : null
  const visible = cards.filter(c =>
    c.category === category &&
    (presetCardIds === null || presetCardIds.includes(c.id))
  ).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2 flex-shrink-0">
        <h2 className="font-display text-[17px] text-txt-m">{CATEGORY_LABELS[category]}</h2>
      </div>
      <CardPager cards={visible} />
    </div>
  )
}
```

**Step 2: Create src/views/HomeView.jsx**

HomeView shows the active preset's cards across all categories in a single pager (Quick Picks mode).

```jsx
import { useStore } from '../store/useStore'
import CardPager from '../components/cards/CardPager'

const CATEGORY_SHORTCUTS = [
  { id: 'food',       label: 'Food',       emoji: '🍗', color: 'bg-food-l text-food border-food-m' },
  { id: 'activities', label: 'Play',       emoji: '🎯', color: 'bg-act-l text-act border-act-m' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛', color: 'bg-feel-l text-feel border-feel-m' },
  { id: 'people',     label: 'People',     emoji: '👥', color: 'bg-ppl-l text-ppl border-ppl-m' },
]

export default function HomeView() {
  const { cards, presets, presetCards, activePresetId, setActiveTab } = useStore()
  const activePreset = presets.find(p => p.id === activePresetId)
  const presetCardIds = activePresetId ? (presetCards[activePresetId] ?? []) : []

  const quickPicks = cards
    .filter(c => presetCardIds.includes(c.id))
    .sort((a, b) => presetCardIds.indexOf(a.id) - presetCardIds.indexOf(b.id))

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-1 pb-2 flex-shrink-0">
        <p className="font-body font-700 text-[13px] text-txt-m uppercase tracking-wide">
          {activePreset?.icon} {activePreset?.label ?? 'Quick Picks'}
        </p>
      </div>

      <CardPager cards={quickPicks} />

      {/* Category shortcut row */}
      <div className="px-3 pb-3 pt-1 flex gap-2 flex-shrink-0">
        {CATEGORY_SHORTCUTS.map(cat => (
          <button
            key={cat.id}
            onTouchStart={() => setActiveTab(cat.id)}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-btn border ${cat.color} text-xs font-body font-800`}
          >
            <span className="text-xl">{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/views/CategoryView.jsx src/views/HomeView.jsx
git commit -m "feat: add HomeView and CategoryView"
```

---

### Task 14: SpeakingBar

**Files:**
- Create: `src/components/overlay/SpeakingBar.jsx`

**Step 1: Create src/components/overlay/SpeakingBar.jsx**

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export default function SpeakingBar() {
  const { speaking } = useStore()

  return (
    <AnimatePresence>
      {speaking && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute bottom-[72px] inset-x-0 mx-3 mb-1 bg-card rounded-card shadow-modal
                     flex items-center gap-3 px-4 py-3 z-50 border border-bg2"
          style={{ bottom: 'calc(72px + env(safe-area-inset-bottom) + 4px)' }}
        >
          <span className="text-4xl">{speaking.emoji}</span>
          <span className="font-display text-2xl text-txt flex-1">{speaking.label}</span>
          {/* Animated wave dots */}
          <div className="flex gap-1 items-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-txt-m"
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/overlay/SpeakingBar.jsx
git commit -m "feat: add SpeakingBar with slide-up animation"
```

---

## Phase 6: Routines

### Task 15: RoutinesView + RoutineList

**Files:**
- Create: `src/views/RoutinesView.jsx`
- Create: `src/components/routines/RoutineList.jsx`

**Step 1: Create src/components/routines/RoutineList.jsx**

```jsx
import { useStore } from '../../store/useStore'

export default function RoutineList() {
  const { routines, startRoutine } = useStore()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3">
      {routines.map(routine => (
        <button
          key={routine.id}
          onTouchStart={() => startRoutine(routine)}
          onClick={() => startRoutine(routine)}
          className="bg-card rounded-card shadow-card flex flex-col items-center justify-center gap-2
                     py-6 border-none min-h-[100px] active:scale-[0.93] transition-transform"
        >
          <div className="w-16 h-16 rounded-full bg-rtn-l flex items-center justify-center text-4xl">
            {routine.emoji}
          </div>
          <span className="font-display text-sm text-txt text-center px-2 leading-tight">
            {routine.label}
          </span>
        </button>
      ))}
    </div>
  )
}
```

**Step 2: Create src/views/RoutinesView.jsx**

```jsx
import RoutineList from '../components/routines/RoutineList'

export default function RoutinesView() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-4 py-2 flex-shrink-0">
        <h2 className="font-display text-[17px] text-txt-m">Routines</h2>
      </div>
      <RoutineList />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/views/RoutinesView.jsx src/components/routines/RoutineList.jsx
git commit -m "feat: add RoutinesView and RoutineList"
```

---

### Task 16: RoutineFlow + RoutineStep

**Files:**
- Create: `src/components/routines/RoutineStep.jsx`
- Create: `src/components/routines/RoutineFlow.jsx`

**Step 1: Create src/components/routines/RoutineStep.jsx**

```jsx
import { useEffect } from 'react'
import { useStore } from '../../store/useStore'

export default function RoutineStep({ step, stepIndex, totalSteps }) {
  const { startTimer, timer } = useStore()

  // Auto-launch timer when step mounts if it has one
  useEffect(() => {
    if (step.timer_secs) startTimer(step.timer_secs, step.label)
    return () => {} // cleanup handled by RoutineFlow on nextStep
  }, [step.id])

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-8 text-center flex-1">
      {/* Step counter */}
      <p className="font-body font-700 text-txt-l text-sm">
        Step {stepIndex + 1} of {totalSteps}
      </p>

      {/* Emoji */}
      <div className="w-32 h-32 rounded-full bg-rtn-l flex items-center justify-center text-[80px]">
        {step.emoji}
      </div>

      {/* Label */}
      <div>
        <p className="font-display text-3xl text-txt leading-tight">{step.label}</p>
        {step.sub_label && (
          <p className="font-body font-600 text-txt-m text-base mt-1">{step.sub_label}</p>
        )}
      </div>

      {/* Timer display if running */}
      {timer.running && (
        <div className={`font-display text-5xl transition-colors
          ${timer.remainingSecs / timer.totalSecs > 0.5 ? 'text-food'
          : timer.remainingSecs / timer.totalSecs > 0.2 ? 'text-act'
          : 'text-feel animate-pulse'}`}
        >
          {Math.floor(timer.remainingSecs / 60) > 0
            ? `${Math.floor(timer.remainingSecs / 60)}:${String(timer.remainingSecs % 60).padStart(2, '0')}`
            : `${timer.remainingSecs}s`}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Create src/components/routines/RoutineFlow.jsx**

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import RoutineStep from './RoutineStep'

export default function RoutineFlow() {
  const { routineActive, routineStepIndex, routineSteps, nextStep, closeRoutine } = useStore()
  if (!routineActive) return null

  const steps = routineSteps[routineActive.id] ?? []
  const currentStep = steps[routineStepIndex]
  const isLast = routineStepIndex >= steps.length - 1

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 32 }}
      className="absolute inset-0 bg-bg z-50 flex flex-col"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
           style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{routineActive.emoji}</span>
          <span className="font-display text-xl text-txt">{routineActive.label}</span>
        </div>
        <button
          onTouchStart={closeRoutine}
          onClick={closeRoutine}
          className="w-9 h-9 rounded-btn bg-card shadow-btn flex items-center justify-center text-lg text-txt-m"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-bg2 mx-4 rounded-full flex-shrink-0">
        <div
          className="h-full bg-rtn rounded-full transition-all duration-300"
          style={{ width: `${((routineStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={routineStepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {currentStep && (
            <RoutineStep
              step={currentStep}
              stepIndex={routineStepIndex}
              totalSteps={steps.length}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Next / Done button */}
      <div className="px-6 pb-4 flex-shrink-0">
        <button
          onTouchStart={nextStep}
          onClick={nextStep}
          className="w-full py-4 rounded-btn bg-rtn text-white font-display text-xl shadow-modal
                     active:scale-[0.97] transition-transform"
        >
          {isLast ? '🎉 All Done!' : 'Next →'}
        </button>
      </div>
    </motion.div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/routines/RoutineStep.jsx src/components/routines/RoutineFlow.jsx
git commit -m "feat: add RoutineFlow with step animations and timer integration"
```

---

## Phase 7: Presets & Settings

### Task 17: PresetSwitcher

**Files:**
- Create: `src/components/presets/PresetSwitcher.jsx`

**Step 1: Create src/components/presets/PresetSwitcher.jsx**

```jsx
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
              <button onTouchStart={closePresetSwitcher} onClick={closePresetSwitcher}
                className="w-8 h-8 rounded-full bg-bg2 flex items-center justify-center text-txt-m text-sm">
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
                    <span className={`font-body font-700 text-sm ${isActive ? 'text-act' : 'text-txt'}`}>
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
```

**Step 2: Commit**

```bash
git add src/components/presets/PresetSwitcher.jsx
git commit -m "feat: add PresetSwitcher bottom sheet"
```

---

### Task 18: SettingsModal + AddCard

**Files:**
- Create: `src/components/settings/SettingsModal.jsx`
- Create: `src/components/settings/AddCard.jsx`

**Step 1: Create src/components/settings/AddCard.jsx**

```jsx
import { useState } from 'react'
import { useStore } from '../../store/useStore'

const CATEGORIES = [
  { id: 'food',       label: 'Food',       emoji: '🍗' },
  { id: 'activities', label: 'Activities', emoji: '🎯' },
  { id: 'feelings',   label: 'Feelings',   emoji: '💛' },
  { id: 'people',     label: 'People',     emoji: '👥' },
]

const QUICK_EMOJIS = ['⭐','🌟','❤️','🎈','🎁','🏆','🌈','🦁','🐯','🐻','🦊','🐸','🍎','🍦','🍰','🎮','📱','🎸','⚽','🚀']

export default function AddCard({ onClose }) {
  const { addCard } = useStore()
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [category, setCategory] = useState('activities')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!label.trim()) return
    setSaving(true)
    await addCard({ label: label.trim(), emoji, category })
    setSaving(false)
    onClose()
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <h3 className="font-display text-xl text-txt">Add a Card</h3>

      {/* Emoji picker */}
      <div>
        <label className="font-body font-700 text-sm text-txt-m block mb-2">Emoji</label>
        <div className="flex flex-wrap gap-2">
          {QUICK_EMOJIS.map(e => (
            <button key={e}
              onTouchStart={() => setEmoji(e)} onClick={() => setEmoji(e)}
              className={`text-2xl p-1.5 rounded-lg border-2 ${emoji === e ? 'border-act bg-act-l' : 'border-transparent'}`}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Label */}
      <div>
        <label className="font-body font-700 text-sm text-txt-m block mb-2">Label</label>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Card name..."
          className="w-full bg-bg border border-bg2 rounded-btn px-3 py-2.5 font-body text-txt text-base outline-none focus:border-act"
        />
      </div>

      {/* Category */}
      <div>
        <label className="font-body font-700 text-sm text-txt-m block mb-2">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.id}
              onTouchStart={() => setCategory(cat.id)} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 p-3 rounded-btn border-2 text-left
                ${category === cat.id ? 'border-act bg-act-l' : 'border-bg2 bg-bg'}`}>
              <span>{cat.emoji}</span>
              <span className="font-body font-700 text-sm text-txt">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-bg rounded-btn p-4 flex items-center gap-4">
        <span className="text-5xl">{emoji}</span>
        <span className="font-display text-lg text-txt">{label || 'Preview'}</span>
      </div>

      <button
        onTouchStart={handleSave} onClick={handleSave}
        disabled={!label.trim() || saving}
        className="w-full py-4 rounded-btn bg-act text-white font-display text-lg shadow-btn
                   disabled:opacity-50 active:scale-[0.97] transition-transform"
      >
        {saving ? 'Saving...' : 'Add Card'}
      </button>
    </div>
  )
}
```

**Step 2: Create src/components/settings/SettingsModal.jsx**

```jsx
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import AddCard from './AddCard'

export default function SettingsModal() {
  const { settingsOpen, closeSettings, settings, updateSettings } = useStore()
  const [view, setView] = useState('main') // 'main' | 'addCard'

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
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-bg2"
               style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
            <h2 className="font-display text-xl text-txt">
              {view === 'addCard' ? 'Add a Card' : 'Settings'}
            </h2>
            <button
              onTouchStart={view === 'addCard' ? () => setView('main') : handleClose}
              onClick={view === 'addCard' ? () => setView('main') : handleClose}
              className="w-9 h-9 rounded-btn bg-bg2 flex items-center justify-center text-txt-m font-body font-700"
            >
              {view === 'addCard' ? '←' : '✕'}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'main' && (
              <div className="flex flex-col gap-1 p-4">
                {/* Cards section */}
                <p className="font-body font-800 text-xs text-txt-l uppercase tracking-wider px-2 pb-1 pt-2">Cards</p>
                <SettingsRow icon="➕" label="Add a Card" onPress={() => setView('addCard')} />

                {/* Voice section */}
                <p className="font-body font-800 text-xs text-txt-l uppercase tracking-wider px-2 pb-1 pt-4">Voice</p>
                <div className="bg-card rounded-btn p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body font-700 text-sm text-txt">Speed</span>
                    <input type="range" min="0.5" max="1.2" step="0.05"
                      value={settings.voiceRate}
                      onChange={e => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                      className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-body font-700 text-sm text-txt">Pitch</span>
                    <input type="range" min="0.8" max="1.5" step="0.05"
                      value={settings.voicePitch}
                      onChange={e => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                      className="w-32" />
                  </div>
                </div>

                {/* Sound section */}
                <p className="font-body font-800 text-xs text-txt-l uppercase tracking-wider px-2 pb-1 pt-4">Sound</p>
                <div className="bg-card rounded-btn p-4 flex items-center justify-between">
                  <span className="font-body font-700 text-sm text-txt">Transition Chime</span>
                  <button
                    onTouchStart={() => updateSettings({ transitionChimeEnabled: !settings.transitionChimeEnabled })}
                    onClick={() => updateSettings({ transitionChimeEnabled: !settings.transitionChimeEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors ${settings.transitionChimeEnabled ? 'bg-food' : 'bg-bg2'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5
                      ${settings.transitionChimeEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Version */}
                <p className="text-center font-body text-xs text-txt-l pt-6">Benny Talks v1.0.0</p>
              </div>
            )}
            {view === 'addCard' && <AddCard onClose={() => setView('main')} />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SettingsRow({ icon, label, onPress }) {
  return (
    <button
      onTouchStart={onPress} onClick={onPress}
      className="bg-card rounded-btn p-4 flex items-center gap-3 w-full text-left active:bg-bg2 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-body font-700 text-sm text-txt flex-1">{label}</span>
      <span className="text-txt-l text-sm">›</span>
    </button>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/settings/SettingsModal.jsx src/components/settings/AddCard.jsx
git commit -m "feat: add SettingsModal and AddCard"
```

---

## Phase 8: Final Wiring

### Task 19: Clean up Vite defaults + verify full app

**Files:**
- Delete: `src/assets/react.svg`, `public/vite.svg`
- Modify: `src/main.jsx`

**Step 1: Update src/main.jsx**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Step 2: Update index.html title**

Change `<title>Vite + React</title>` to `<title>Benny Talks</title>`

**Step 3: Run dev server and verify full app**

```bash
npm run dev
```

Manually verify in browser (or iPhone simulator):
- [ ] All 6 nav tabs switch views
- [ ] Cards appear in each category
- [ ] Tapping a card speaks the label
- [ ] Speaking bar slides up and fades
- [ ] Timer pill shows when timer is running
- [ ] Routines open in full-screen flow
- [ ] Preset switcher opens/closes
- [ ] Settings modal opens with X to close
- [ ] Add card form works

**Step 4: Run build to verify no errors**

```bash
npm run build
```
Expected: Build completes with no errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: Benny Talks v1.0.0 — complete P0 build"
```

---

## Appendix: Tailwind class mapping for category colors

Since Tailwind purges unused classes, if dynamic class names don't work, add a safelist to `tailwind.config.js`:

```js
safelist: [
  'bg-food', 'bg-food-l', 'bg-food-m', 'text-food', 'border-food', 'border-food-m', 'ring-food',
  'bg-act',  'bg-act-l',  'bg-act-m',  'text-act',  'border-act',  'border-act-m',
  'bg-feel', 'bg-feel-l', 'bg-feel-m', 'text-feel', 'border-feel', 'border-feel-m',
  'bg-ppl',  'bg-ppl-l',  'bg-ppl-m',  'text-ppl',  'border-ppl',  'border-ppl-m',
  'bg-rtn',  'bg-rtn-l',  'bg-rtn-m',  'text-rtn',  'border-rtn',  'border-rtn-m',
  'bg-cust', 'bg-cust-l', 'bg-cust-m', 'text-cust', 'border-cust', 'border-cust-m',
  'text-txt-m', 'text-txt-l',
],
```
