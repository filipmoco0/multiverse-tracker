-- Public portfolio statistic for Moco's external portfolio.
-- Returns only an aggregate. It never exposes auth.users rows or user data.
-- Apply this file in the Supabase SQL Editor for project zpdhjktfkojgqqacfuta.

create or replace function public.get_public_user_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $function$
  select count(*)::bigint
  from auth.users
  where confirmed_at is not null
    and coalesce(is_anonymous, false) = false;
$function$;

comment on function public.get_public_user_count() is
  'Returns only the count of confirmed, non-anonymous accounts for the public Moco portfolio.';

revoke all on function public.get_public_user_count() from public;
grant execute on function public.get_public_user_count() to anon, authenticated;
