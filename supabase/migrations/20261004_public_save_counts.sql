-- Aggregate only: never expose owners or collection names.
create or replace function public.place_save_count(requested_place_id bigint)
returns bigint language sql stable security definer set search_path = public
as $$
  select count(distinct c.owner_id)
  from public.collection_places cp
  join public.collections c on c.id = cp.collection_id
  where cp.place_id = requested_place_id;
$$;
revoke all on function public.place_save_count(bigint) from public;
grant execute on function public.place_save_count(bigint) to anon, authenticated;
