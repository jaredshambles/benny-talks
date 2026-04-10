# Benny Talks — Claude Code Project Brief
## Complete handoff document for rebuilding as a production React/Supabase/Cloudflare app

---

## 1. What This Is

Benny Talks is a custom AAC (Augmentative and Alternative Communication) app built specifically for Benicio "Benny" Ardine, age 3.5, who has Level 2 Autism Spectrum Disorder. It is used daily by Benny, his parents (Jared and Grella), his grandmother (Glammy), and his ABA therapy team at Hope Comprehensive Center for Development in Murrieta, CA.

The app is a PECS-style (Picture Exchange Communication System) communication board that allows Benny to tap image cards to request items, express feelings, and navigate daily routines. It also includes a visual timer, transition chime, step-by-step routine guides, and usage analytics.

This is a real clinical tool, not a demo. Every design and UX decision should be made with a 3.5-year-old autistic child as the primary user, with parents and RBTs (Registered Behavior Technicians) as secondary users.

---

## 2. Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion for animations
- Fonts: Fredoka One (display), Nunito (body) from Google Fonts

### Backend
- Supabase — Postgres DB, Storage, Auth, Realtime
- Cloudflare Pages — frontend deployment
- Cloudflare Worker — server-side API calls (Anthropic)

---

## 3. Database Schema

```sql
create table cards (
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

create table presets (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  icon text not null default '⭐',
  sort_order int default 0,
  created_at timestamptz default now()
);

create table preset_cards (
  id uuid primary key default gen_random_uuid(),
  preset_id uuid references presets(id) on delete cascade,
  card_id uuid references cards(id) on delete cascade,
  sort_order int default 0,
  unique(preset_id, card_id)
);

create table tap_log (
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

create table routines (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  emoji text not null,
  intro_text text,
  sort_order int default 0,
  is_system boolean default true,
  created_at timestamptz default now()
);

create table routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references routines(id) on delete cascade,
  emoji text not null,
  label text not null,
  sub_label text,
  timer_secs int,
  sort_order int default 0
);
```

---

## 4. Design System

### Colors
```css
--bg: #FDF6EE;  --bg2: #F5EDE0;  --card: #FFFFFF;
--food: #2A9D8F;  --food-l: #E8F7F5;  --food-m: #B2E4DF;
--act: #E07C24;   --act-l: #FEF3E8;   --act-m: #FAD5AD;
--feel: #E05C7A;  --feel-l: #FDEDF1;  --feel-m: #F5B8C8;
--ppl: #3A7DC9;   --ppl-l: #EAF2FC;   --ppl-m: #AECFEF;
--rtn: #7B61D6;   --rtn-l: #F0ECFD;   --rtn-m: #C9BEED;
--cust: #D4A017;  --cust-l: #FDF6E3;  --cust-m: #F5DFA0;
--txt: #2D2416;   --txtm: #7A6A56;    --txtl: #B5A08A;
```

### Typography
- Fredoka One — display, card labels, headers, timer
- Nunito — all other UI, weights 600/700/800/900

### Card Grid
- Mobile < 480px: 2 columns x 3 rows = 6 cards per page
- Tablet >= 480px: 3 columns x 2 rows = 6 cards per page
- Horizontal swipe between pages
- Dot indicators below grid

---

## 5. Card Data

### Food (13)
Chicken Nuggets 🍗, Pizza 🍕, French Fries 🍟, Ranch 🥣, Toast Sticks 🍞,
Green Juice 🥤, Water 💧, Blueberries 🫐, Strawberries 🍓, Banana 🍌,
Fig Bars 🍪, Milk 🥛, Crackers 🍘

### Activities (16)
Tractor 🚜 (highest priority — most reliable spontaneous word),
Trampoline 🤸, Hot Wheels 🏎️, Car Ride 🚗, Blippi 🎉, Dream Machine 📖,
Tonies 🎵, Guitar 🎸, Drums 🥁, Park 🌳, Garden 🌱,
Glammy's House 👵, YouTube ▶️, Swing 🪁, Water Play 💦, See Ducks 🦆

### Feelings (14)
Happy 😄 (highest priority — spontaneous word),
No 🙅, Yes 👍, All Done ✅, More 🙌, Help 🤝, Wait ✋, Stop 🛑,
Tired 😴, Mad 😠, Scared 😨, Hurt 🤕, Hungry 🍽️, I Want 🫳

### People (8)
Mom 👩, Dad 👨, Glammy 👵, Willow 🐕, Frida 🐶,
Heather 👩‍🦰 (RBT), Cassie 👩‍🦱 (RBT), Angelique 👩‍💼 (BCBA)

### Routines (9)
Potty Time 🚽, Wash Hands 🧼, Diaper Change 👶, Bath Time 🛁,
Shoes On 👟, Get Dressed 👕, Clean Up 🧹, Nap Time 😴, Bedtime 🌙

---

## 6. Routine Steps

### Potty Time (5-min sit matches ABA 40-min interval protocol)
Walk to bathroom → Pull down pullup → Sit on toilet (300s timer) →
Wipe and flush → Pull up pullup → Wash hands

### Wash Hands
Turn on water → Wet hands → Add soap → Scrub (20s timer) → Rinse → Dry

### Diaper Change (caregiver-led, priming language)
Lie down → Pullup off → Clean up → New pullup on → Wash hands

### Bath Time
Take off clothes → Get in tub → Wash hair → Wash body → Rinse → Dry → Get dressed

### Shoes On
Sit down → First shoe → Foot in → Second shoe → Other foot → Stand up

### Get Dressed
Underwear → Shirt → Pants → Socks → Shoes

### Clean Up
Look at mess → Pick up toys → Stack books → All done

### Nap Time
Try potty → Lie down → Grab comfort item → Close eyes

### Bedtime
Use potty → Brush teeth (60s timer) → Pajamas → Story time → Lights out

---

## 7. Presets

### ABA Class 🏫
More, All Done, Help, Wait, No, Yes, I Want, Water, Tractor, Hot Wheels, Heather, Cassie

### Home 🏠
Tractor, Chicken Nuggets, Water, Trampoline, Hot Wheels, Blippi,
More, All Done, Mom, Dad, French Fries, Guitar

### Glammy's House 👵
Glammy, Garden, Chicken Nuggets, Banana, Tractor, Happy,
More, All Done, Water, YouTube, Mom, Dad

### Out and About 🌎
Help, Wait, No, Water, Chicken Nuggets, All Done,
Car Ride, Park, Hungry, Tired, Mom, Dad

---

## 8. Clinical Context

**Diagnosis:** Level 2 ASD, May 2025
**ABA:** Hope Comprehensive Center for Development, Murrieta CA
**BCBA:** Angelique Carrillo M.S., BCBA, SLPA
**RBTs:** Heather E., Cassie G.
**Hours:** 23.5/week (recommendation: 25)

**Active ABA goals relevant to this app:**
- Mand for access — 93% accuracy, scaling to 1-2 word requests
- Mand for cessation (no/stop/all done) — mastered
- Receptive identification of objects — in progress
- Visual schedule / transitions — in progress, 87%
- Waiting — mastered up to 2 minutes
- Coping strategies — in progress

**Vineland-3 (March 2026):**
- Communication: 70 (2nd percentile)
- Socialization: 66 (1st percentile) — lowest: Play & Leisure
- Daily Living: 76 (5th percentile) — relative strength

**Communication profile:**
- Understands more than he can express
- Reliable words: Tractor, Happy, No, Why
- Working toward 1-2 word requests
- Responds well to music and consistent screen interactions
- Familiar with cause-effect media (Tonies toy)

**Potty training:**
- Pullup during ABA sessions
- Brought to bathroom every 40 minutes
- 5-minute sit on toilet
- Increasing trend, ~77% correct

---

## 9. UX Rules (non-negotiable)

1. No vertical scrolling on main card view. Horizontal pagination only.
2. Cards fire on touchstart, not touchend.
3. Every modal has X close button visible at top right without scrolling.
4. No hamburger menus. Bottom nav always visible.
5. Benny cannot accidentally open settings.
6. Spoken label always before reward sound.
7. Language matches ABA team: "All Done" not "Finished", "More" not "Again".
8. Timer chime (ascending 4-note) distinct from transition chime (descending 2-note).
9. Routine timers auto-launch from step — no separate setup.
10. App works offline after first load.

---

## 10. Voice Recording Spec (P1)

- Button in card edit modal: "Record My Voice"
- Request mic permission
- 3-second countdown before recording
- Tap to start / tap to stop
- Playback to review
- Re-record option
- On save: upload to Supabase Storage, update card.audio_url
- On card tap: check audio_url first, fall back to Web Speech API
- Use MediaRecorder API, store as audio/webm or audio/mp4, max 5 seconds

---

## 11. Feature Priority

### P0 — Launch
- All cards with swipeable 2-col grid
- Touchstart activation
- Web Speech (Samantha > Nicky > Monica > Karen > Daniel > fallback)
- Bottom nav 6 tabs
- Routine flow with step timers
- Visual timer with header pill
- Transition chime
- Preset system (4 defaults + editor)
- Add card
- Settings with X close
- Tap logging to Supabase
- localStorage offline fallback

### P1 — First sprint after launch
- Card image upload (camera roll + camera)
- Voice recording per card
- Card edit modal
- Analytics dashboard
- CSV export

### P2
- Offline PWA / service worker
- Custom routine builder
- Multiple profiles

### Pinned for later
- AI image search with real photos
- ABA team portal integration
- Predictive card surfacing

---

## 12. Starter Prompt for Claude Code

Paste this at the start of your Claude Code session along with this file:

---

I'm building a production React app called Benny Talks — a custom AAC (communication) app for my 3.5-year-old son who has autism. I have a complete project brief in BRIEF.md that describes everything.

Stack: React + Vite + Tailwind, Supabase for database and storage, Cloudflare Pages for deployment.

Please start by:
1. Scaffolding the project with Vite + React + Tailwind
2. Setting up Supabase client with environment variables
3. Creating the design system (CSS variables, Google Fonts)
4. Building BottomNav with 6 tabs
5. Building PecsCard with touchstart activation, ripple, and speak-on-tap
6. Loading default card data

Critical UX rule: cards fire on touchstart not touchend, and zero vertical scrolling on the main card view — horizontal pagination only.

---

## 13. Files to Bring

- BRIEF.md (this file)
- index.html (v0.6.0 reference implementation)
- CHANGELOG.md
- analytics-script.gs

---

## 14. Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=  # server-side only via Cloudflare Worker
```

---

Document version: 1.0 — April 2026
App version at handoff: v0.6.0
Next target: v1.0.0 (React/Supabase/Cloudflare)
