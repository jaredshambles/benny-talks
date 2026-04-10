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
