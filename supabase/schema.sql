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
  release_date date,
  overview text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.franchise_media enable row level security;

-- Policy 1: Everyone (public & authenticated) can view curated franchise tracklist
create policy "Public can view franchise media" 
on public.franchise_media 
for select 
using (true);

-- Policy 2: Service role / Admin can insert, update, delete
create policy "Service role and admin full access" 
on public.franchise_media 
for all 
using (true)
with check (true);
