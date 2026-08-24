-- Multiverse Tracker: Supabase Database Schema
-- Table: franchise_media

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

-- Policy 1: Everyone can view the franchise tracklist
drop policy if exists "Public can view franchise media" on public.franchise_media;
create policy "Public can view franchise media" 
on public.franchise_media 
for select 
using (true);

-- Policy 2: Admin / Service full access
drop policy if exists "Service role and admin full access" on public.franchise_media;
create policy "Service role and admin full access" 
on public.franchise_media 
for all 
using (true)
with check (true);
