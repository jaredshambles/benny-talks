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
