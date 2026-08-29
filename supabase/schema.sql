-- Hongdae Map: Supabase SQL editor에서 한 번 실행합니다.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.places (
  id bigint primary key,
  name text not null,
  type text,
  status text not null default 'unverified',
  lat double precision,
  lng double precision,
  address text,
  category text,
  tags jsonb not null default '[]'::jsonb,
  source jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  emoji text not null default '📍',
  created_at timestamptz not null default now()
);

create table if not exists public.collection_places (
  collection_id uuid not null references public.collections(id) on delete cascade,
  place_id bigint not null references public.places(id) on delete cascade,
  memo text check (char_length(memo) <= 500),
  visited_at date,
  personal_rating smallint check (personal_rating between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (collection_id, place_id)
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'idea' check (type in ('bug', 'idea', 'place', 'other')),
  message text not null check (char_length(message) between 3 and 2000),
  contact text check (char_length(contact) <= 200),
  status text not null default 'new' check (status in ('new', 'reviewing', 'done')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.collections enable row level security;
alter table public.collection_places enable row level security;
alter table public.feedbacks enable row level security;

create policy "profiles are visible to their owner" on public.profiles for select using (id = auth.uid());
create policy "places are public" on public.places for select using (true);
create policy "admins manage places" on public.places for all using ((select role from public.profiles where id = auth.uid()) = 'admin') with check ((select role from public.profiles where id = auth.uid()) = 'admin');
create policy "owners manage collections" on public.collections for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owners manage collection places" on public.collection_places for all using (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid())) with check (exists (select 1 from public.collections c where c.id = collection_id and c.owner_id = auth.uid()));
create policy "anyone can submit feedback" on public.feedbacks for insert with check (true);
create policy "admins manage feedback" on public.feedbacks for all using ((select role from public.profiles where id = auth.uid()) = 'admin') with check ((select role from public.profiles where id = auth.uid()) = 'admin');

-- 첫 관리자 지정: 가입 후 아래 이메일을 실제 관리자 이메일로 바꿔 한 번 실행합니다.
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'admin@example.com');
