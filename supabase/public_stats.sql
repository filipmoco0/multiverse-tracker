-- Public portfolio statistic for Moco's external portfolio.
-- Returns only an aggregate count of synced user profiles, never user data.
-- Apply this file in the Supabase SQL Editor for project zpdhjktfkojgqqacfuta.

create or replace function public.get_public_user_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $function$
  select count(*)::bigint
  from public.user_profiles;
$function$;

comment on function public.get_public_user_count() is
  'Returns only the aggregate count of Multiverse Tracker user profiles synced to cloud.';

revoke all on function public.get_public_user_count() from public;
grant execute on function public.get_public_user_count() to anon, authenticated;
