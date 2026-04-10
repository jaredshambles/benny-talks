# Benny Talks — Changelog

All notable changes to this project will be documented here.
Format: [Version] — Date — Description

---

## [0.4.0] — 2026-04-08
### Added
- Routine presets (ABA Class, Home, Glammy's House, Out and About)
  - Active preset name replaces "Quick Picks" label in header
  - Preset switcher accessible via chevron next to preset name
  - Settings panel includes preset card editor and add new preset
- Nap Time card in Routines category
- Tired card in Feelings category
- Version number display in lower right corner of home screen
- Changelog tracking

### Changed
- Quick Picks section now labeled with active routine preset name
- Settings menu reorganized with dedicated Routine Presets section
- Card settings now include image change and voice recording options (UI scaffolding — full recording requires Supabase migration)

### Infrastructure note
- Current build: single HTML file, localStorage persistence, Google Sheets analytics via Apps Script
- Planned migration: React + Supabase + Cloudflare Pages (see architecture notes)

---

## [0.3.0] — 2026-04-08
### Added
- Transition chime (bell icon) — soft two-note bell, spoken prompt, amber overlay
- Add a Card feature — accessible to RBTs without parent mode, AI emoji suggestions via Claude API
- Google Sheets analytics integration — tap log, routine completions, timer events
- Unified Settings panel replacing separate parent modal
- Custom cards category with cross-category saving
- New routines: Diaper Change (pullup language), Bath Time, Shoes On
- Updated Potty Time to 5-minute sit timer matching ABA schedule (40-min interval protocol)
- Handwash 20-second scrub timer

### Changed
- Settings/parent mode now accessible via gear icon (previously long-press only)
- Timer chime and transition chime are distinct sounds (ascending vs descending)
- Voice rate slowed to 0.80, warmer pitch 1.10 for less robotic output

### Fixed
- People cards showing Mama/Dada corrected to Mom/Dad

---

## [0.2.0] — 2026-04-08
### Added
- Visual timer with preset durations (30s, 1m, 2m, 3m, 5m, 10m)
- Live countdown in header center when timer running
- Timer pill color progression: green → amber → red + pulse at <20%
- Pause/resume on timer pill tap
- Timer completion chime (synthesized 4-note C major arpeggio, no audio file needed)
- Timer done celebration overlay
- Quick Picks section on home screen (top 8 by tap frequency, smart defaults)
- Routines category: Potty Time, Wash Hands, Get Dressed, Clean Up, Bedtime
- Step-based routine flow with visual task analysis format
- Routine steps with optional built-in timers
- Routine timer auto-launches from step

### Changed
- Voice quality: priority list now tries Samantha, Nicky, Monica, Karen, Daniel, Moira
- Voice rate 0.82 → improved from 0.88 (less robotic)
- Home screen restructured: Quick Picks grid + All Categories below

### Fixed
- Speaking bar now uses warmer voice priority

---

## [0.1.0] — 2026-04-08
### Added
- Initial build: single HTML file PWA
- Four categories: Food (11 cards), Activities (9 cards), Feelings (8 cards), People (5 cards)
- Card tap triggers spoken label + color bloom animation + speaking bar
- Reward audio system (Tonies-style) — plays after spoken label for high-motivation cards
- Tap logging to localStorage with timestamp
- Parent stats dashboard (long-press logo) — today's taps, total, top word, recent list
- CSV export from parent dashboard
- iOS PWA support (Add to Home Screen)
- Warm color palette, Fredoka One + Nunito typography
- Ripple animation on card tap

### Cards
- Food: Chicken Nuggets, Pizza, French Fries, Ranch, Toast Sticks, Green Juice, Water,
  Blueberries, Strawberries, Banana, Fig Bars
- Activities: Trampoline, Car Ride, Park, Glammy, Garden, Hot Wheels, Dream Machine,
  YouTube, Blippi
- Feelings: Happy, No, Yes, All Done, More, Help, Wait, Stop
- People: Mom, Dad, Glammy, Willow, Frida

---

## [0.5.0] — 2026-04-08 — Final single-file version
### Added
- Tractor card in Activities (Benny's most reliable expressive word)
- Guitar and Drums cards in Activities (watches Dad play, imitates strumming)
- Tonies card in Activities
- Water Play and See Ducks cards in Activities
- Hungry and I Want cards in Feelings (supports active manding goals)
- Hurt and Scared cards in Feelings
- Heather, Cassie, Angelique in People (named RBTs from ABA report)
- Full preset editor in Settings — tap any preset to edit which cards appear
- Add New Preset from Settings with icon picker
- New preset immediately opens card editor after creation
- Clear All Data option in Settings (with confirmation)
- Preset label in header shows icon + name of active setting

### Cards selected based on
- Vineland-3 assessment (March 2026): receptive/expressive gaps, Play & Leisure as lowest domain
- ABA progress report: active manding goals, VB-MAPP profile, named clinical team
- Benny's known interests: tractor (says constantly), cars, music, water, Blippi, Tonies
- Daily friction points: potty training (40-min schedule, 5-min sit), transitions, sharing

### Pinned for Claude Code migration
- Voice recording per card (requires file storage)
- Photo upload from camera roll (requires storage bucket)
- Multi-device sync (requires database)
- AI image search with real photos (requires server-side API key)
- Per-card analytics drill-down
- RBT account management with permissions
- Offline PWA with service worker caching
