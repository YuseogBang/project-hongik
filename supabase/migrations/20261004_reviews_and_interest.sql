-- Run once in the Supabase SQL editor after schema.sql.
-- Static map place IDs are authoritative; places may not yet be imported.
create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  place_id bigint not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(btrim(body)) between 5 and 500),
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (place_id, user_id)
);
create index if not exists place_reviews_place_created_idx on public.place_reviews (place_id, created_at desc);

create table if not exists public.place_interest_events (
  id bigint generated always as identity primary key,
  place_id bigint not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'save', 'directions')),
  created_at timestamptz not null default now()
);
create index if not exists place_interest_events_created_idx on public.place_interest_events (created_at desc);
create index if not exists place_interest_events_place_created_idx on public.place_interest_events (place_id, created_at desc);

create or replace function public.is_hongdae_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.place_reviews enable row level security;
alter table public.place_interest_events enable row level security;
create policy "published or own reviews are visible" on public.place_reviews for select
  using (status = 'published' or user_id = auth.uid() or public.is_hongdae_admin());
create policy "members add own reviews" on public.place_reviews for insert to authenticated
  with check (user_id = auth.uid() and status = 'published');
create policy "members edit own reviews and admins moderate" on public.place_reviews for update to authenticated
  using (user_id = auth.uid() or public.is_hongdae_admin())
  with check ((user_id = auth.uid() and status = 'published') or public.is_hongdae_admin());
create policy "members remove own reviews and admins moderate" on public.place_reviews for delete to authenticated
  using (user_id = auth.uid() or public.is_hongdae_admin());
create policy "members log own interest" on public.place_interest_events for insert to authenticated
  with check (user_id = auth.uid());
create policy "admins read interest" on public.place_interest_events for select to authenticated
  using (public.is_hongdae_admin());

-- Prevent a member from altering ownership, business ID, or moderation status.
create or replace function public.guard_place_review_update()
returns trigger language plpgsql as $$
begin
  if not public.is_hongdae_admin() and
    (new.user_id <> old.user_id or new.place_id <> old.place_id or new.status <> old.status) then
    raise exception 'Only an administrator can change review ownership or status';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
create trigger guard_place_review_update before update on public.place_reviews
for each row execute function public.guard_place_review_update();

create or replace function public.admin_interest_summary()
returns table(day date, place_id bigint, event_type text, total bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_hongdae_admin() then
    raise exception 'Administrator access required';
  end if;
  return query
    select (e.created_at at time zone 'Asia/Seoul')::date, e.place_id, e.event_type, count(*)
    from public.place_interest_events e
    where e.created_at >= now() - interval '30 days'
    group by 1, 2, 3;
end;
$$;
revoke all on function public.admin_interest_summary() from public, anon;
grant execute on function public.admin_interest_summary() to authenticated;
