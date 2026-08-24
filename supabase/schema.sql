-- Multiverse Tracker: Supabase Database Schema

-- ============================================================
-- 1. Table: franchise_media (Curated Tracklist)
-- ============================================================
create table if not exists public.franchise_media (
  id text primary key,
  universe text check (universe in ('mcu', 'dcu')) not null,
  title text not null,
  media_type text check (media_type in ('movie', 'show', 'special')) not null,
  release_order int not null,
  chronological_order int,
  phase_or_chapter text not null,
  trakt_id int,
  tmdb_id int,
  poster_path text,
  is_released boolean default true,
  release_date text,
  overview text,
  seasons int,
  episodes int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- In case table already exists with date type or missing columns, alter them safely:
alter table public.franchise_media alter column release_date type text using release_date::text;
alter table public.franchise_media add column if not exists seasons int;
alter table public.franchise_media add column if not exists episodes int;

-- Enable Row Level Security (RLS)
alter table public.franchise_media enable row level security;

drop policy if exists "Public can view franchise media" on public.franchise_media;
create policy "Public can view franchise media" 
on public.franchise_media 
for select 
using (true);

drop policy if exists "Service role and admin full access" on public.franchise_media;
create policy "Service role and admin full access" 
on public.franchise_media 
for all 
using (true)
with check (true);


-- ============================================================
-- 2. Table: user_profiles (Cross-Device Cloud Sync)
-- Saves user watched checkboxes, Trakt username/token, & BYOK API keys!
-- ============================================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  watched_ids jsonb default '{}'::jsonb,
  trakt_username text,
  trakt_token text,
  tmdb_api_key text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for user profiles
alter table public.user_profiles enable row level security;

-- Policy: Users can only read and update their own cloud profile
drop policy if exists "Users can view and edit own profile" on public.user_profiles;
create policy "Users can view and edit own profile" 
on public.user_profiles 
for all 
using (auth.uid() = id)
with check (auth.uid() = id);
