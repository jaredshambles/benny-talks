# Safe or Not Safe — Design Spec

**Date:** 2026-05-06  
**Status:** Approved for implementation

---

## Context

Benny (age 3.5, Level 2 ASD) uses Benny Talks daily for AAC communication. This feature adds an educational minigame to help Benny understand safe vs. unsafe things (fire, knives, strangers vs. firefighters, teachers). It is distinct from the PECS communication board — it's a structured learning activity with correct answers, caregiver-managed content, and immediate reinforcement feedback.

---

## Entry Point

A new **Games** tab is added to the bottom navigation bar (icon 🎮), alongside the existing Home, Food, Activities, Feelings, People, and Routines tabs. This brings the total to 7 tabs — implementation should verify fit on small screens and reduce icon/label size if needed (or consider dropping the text label on narrower tabs).

Tapping Games opens a **Game Picker modal** (bottom sheet style, consistent with existing modals). Currently it shows one game: **Safe or Not Safe** (🛡️). A placeholder slot communicates that more games are coming. This modal is the extension point for all future games.

---

## Game Selection Flow

```
Tap Games tab
  → Game Picker modal
      → Tap "Safe or Not Safe"
          → Mode Picker modal
              → "🔀 Shuffle All"  → loads all safety cards, shuffled
              → "📁 Pick a Theme" → Theme Picker list → loads cards for that deck
  → Game starts
```

Both modals are dismissible (tap backdrop or an × button) and return to the Games tab view underneath.

---

## Game Screen Layout

The game screen fills the viewport (no bottom nav visible during play). It contains:

1. **Progress indicator** — a row of small dots/pills across the top showing how many cards are in the session and which one is current (filled/teal = answered regardless of correct/wrong, grey = remaining). Wrong answers do not appear differently — the progress bar is purely forward momentum, not a scorecard.
2. **Card area** — three elements in a horizontal row:
   - **✅ Safe zone** (left) — green tinted panel, ~52px wide, rounded pill. Contains ✅ icon and "Safe" label in small uppercase text underneath.
   - **Card** (center) — white rounded card with shadow. Displays either a custom photo (`img_url`) or emoji, plus the label in Fredoka One. Takes up remaining width.
   - **🚫 Not Safe zone** (right) — red tinted panel, same dimensions as left. Contains 🚫 icon and "Not Safe" label.
3. **Prompt text** — "Is this safe or not safe?" in small muted text below the card row.
4. **Exit button** — small ✕ in the top-right corner to quit the session mid-game.

---

## Answer & Feedback

### On tap (either zone):

1. The tapped zone scales up briefly (press animation, consistent with `PecsCard`).
2. The card's label is **spoken aloud** via Web Speech API (same `speak()` utility, same voice settings).
3. A **full-screen overlay** appears immediately:

**Correct answer:**
- Background: green gradient (`#22c55e → #16a34a`)
- Content: 🎉 emoji, "That's right!", card label + "is [Safe / Not Safe]"
- Spoken: "[Label] is [safe / not safe]!" — reinforces the concept
- Auto-advances after **1.8 seconds**

**Wrong answer:**
- Background: warm orange gradient (`#f97316 → #ea580c`) — not harsh red
- Content: 🤔 emoji, "Let's try again!", correct answer stated: "[Label] is [Safe / Not Safe]"
- Spoken: same reinforcement phrase
- Auto-advances after **2.2 seconds** (slightly longer to let the correct answer land)

No re-tap required on wrong answers — show, tell, move on.

### End of session:

When all cards in the session are answered, a **completion screen** appears:
- 🏆 emoji, "All done, Benny!" — no score, no right/wrong count. Finishing the deck is the win. Voice says "Great job, Benny!"
- A "Play Again" button (reshuffles same deck) and a "Done" button (returns to Games tab)

---

## Data Model

Three new Supabase tables:

### `safety_cards`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `label` | text | Card display name |
| `emoji` | text | Fallback if no image |
| `img_url` | text | Supabase Storage URL (card-images bucket, shared with PECS cards) |
| `is_safe` | boolean | The correct answer |
| `sort_order` | int | Default display order |
| `created_at` | timestamptz | |

### `safety_decks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `label` | text | Theme name (e.g. "Kitchen", "Strangers") |
| `emoji` | text | Icon shown in theme picker |
| `sort_order` | int | |
| `created_at` | timestamptz | |

### `safety_deck_cards`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `deck_id` | uuid FK → safety_decks | Cascade delete |
| `card_id` | uuid FK → safety_cards | Cascade delete |
| `sort_order` | int | |
| unique | (deck_id, card_id) | No duplicates |

A card can belong to multiple decks. Shuffle All uses all `safety_cards` regardless of deck membership.

---

## State Management

Game state lives in a local React component (no Zustand) since it's transient — session data doesn't need to persist across app restarts.

```js
// Local state shape inside SafetyGameView
{
  cards: [],          // shuffled array of safety_card objects for this session
  index: 0,           // current card index
  phase: 'question'   // 'question' | 'feedback' | 'complete'
  lastCorrect: null,  // true/false — drives overlay colour
}
```

Data is fetched fresh at game start (Supabase query), not from the Zustand store.

---

## New Files (Main App)

```
src/
  views/
    GamesView.jsx          # Games tab root — renders GamePickerModal
  components/
    games/
      GamePickerModal.jsx  # Bottom sheet: list of available games
      ModePickerModal.jsx  # Shuffle All vs Pick a Theme
      ThemePickerModal.jsx # List of safety_decks to choose from
      SafetyGame.jsx       # Full game screen (card + zones + overlay)
      SafetyCard.jsx       # The card + side zones component
      FeedbackOverlay.jsx  # Full-screen correct/wrong overlay
      GameComplete.jsx     # End-of-session screen
```

---

## Dashboard Changes

A new **Safety Game** section is added to the dashboard sidebar (between Cards and Presets).

### Cards tab
- Table of all `safety_cards` with thumbnail, label, is_safe badge (✅ / 🚫), deck assignments
- Add card form: label, emoji, image upload (reuses `uploadImage()` from existing dashboard), is_safe toggle
- Edit / delete (delete custom cards only — system seed cards are protected)

### Decks tab
- List of `safety_decks` with card count
- Create / rename / delete decks
- Per-deck card assignment (same assign/remove UI as existing Presets view)

---

## Bottom Nav Change

`BottomNav.jsx` gains a 6th tab entry:

```js
{ id: 'games', label: 'Games', emoji: '🎮' }
```

`App.jsx` renders `<GamesView />` when `activeTab === 'games'`.

---

## App Hydration

`safety_cards` and `safety_decks` are **not** added to the Zustand persist store. They are fetched on demand when a game session starts (small dataset, always fresh). This keeps the store lean and avoids stale cached answers.

---

## Voice

All spoken phrases reuse the existing `speak(text, { rate, pitch })` utility from `src/lib/speech.js` with the caregiver's saved voice settings. Spoken strings:

- On tap: `"[label]"`
- Correct overlay: `"[label] is safe!"` or `"[label] is not safe!"`
- Wrong overlay: `"[label] is not safe!"` or `"[label] is safe!"` (states the correct answer)

---

## Verification

1. Tap Games tab → GamePickerModal appears with "Safe or Not Safe"
2. Tap game → ModePickerModal appears with Shuffle All + Pick a Theme
3. Shuffle All → fetches all `safety_cards`, shuffles, game begins
4. Pick a Theme → ThemePickerModal shows decks → select one → game begins with that deck's cards
5. Correct tap → green overlay, voice speaks correct answer, auto-advances after 1.8s
6. Wrong tap → orange overlay, voice states correct answer, auto-advances after 2.2s
7. All cards answered → completion screen with Play Again / Done
8. Dashboard: add a safety card with image upload → appears in app on next game start
9. Dashboard: create a deck, assign cards → appears in Theme Picker
10. Exit mid-game (✕) → returns to Games tab, no crash
