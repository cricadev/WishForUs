create extension if not exists pgcrypto;

create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  bucket_id uuid not null references public.buckets(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  avatar_preset text default 'heart',
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  bucket_id uuid not null references public.buckets(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.members(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null,
  description text,
  markdown_notes text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  created_by uuid references public.members(id) on delete set null,
  completed_by uuid references public.members(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists buckets_invite_code_idx on public.buckets(invite_code);
create index if not exists members_bucket_id_idx on public.members(bucket_id);
create index if not exists members_auth_user_id_idx on public.members(auth_user_id);
create index if not exists lists_bucket_id_idx on public.lists(bucket_id);
create index if not exists lists_created_by_idx on public.lists(created_by);
create index if not exists items_list_id_idx on public.items(list_id);
create index if not exists items_created_by_idx on public.items(created_by);
create index if not exists items_completed_by_idx on public.items(completed_by);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_items_updated_at on public.items;

create trigger set_items_updated_at
before update on public.items
for each row
execute function public.set_updated_at();

alter table public.buckets enable row level security;
alter table public.members enable row level security;
alter table public.lists enable row level security;
alter table public.items enable row level security;

drop policy if exists "Allow public read buckets" on public.buckets;
drop policy if exists "Allow public insert buckets" on public.buckets;
drop policy if exists "Allow public update buckets" on public.buckets;
drop policy if exists "Allow public delete buckets" on public.buckets;

create policy "Allow public read buckets"
on public.buckets
for select
to anon, authenticated
using (true);

create policy "Allow public insert buckets"
on public.buckets
for insert
to anon, authenticated
with check (true);

create policy "Allow public update buckets"
on public.buckets
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete buckets"
on public.buckets
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow public read members" on public.members;
drop policy if exists "Allow public insert members" on public.members;
drop policy if exists "Allow public update members" on public.members;
drop policy if exists "Allow public delete members" on public.members;

create policy "Allow public read members"
on public.members
for select
to anon, authenticated
using (true);

create policy "Allow public insert members"
on public.members
for insert
to anon, authenticated
with check (true);

create policy "Allow public update members"
on public.members
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete members"
on public.members
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow public read lists" on public.lists;
drop policy if exists "Allow public insert lists" on public.lists;
drop policy if exists "Allow public update lists" on public.lists;
drop policy if exists "Allow public delete lists" on public.lists;

create policy "Allow public read lists"
on public.lists
for select
to anon, authenticated
using (true);

create policy "Allow public insert lists"
on public.lists
for insert
to anon, authenticated
with check (true);

create policy "Allow public update lists"
on public.lists
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete lists"
on public.lists
for delete
to anon, authenticated
using (true);

drop policy if exists "Allow public read items" on public.items;
drop policy if exists "Allow public insert items" on public.items;
drop policy if exists "Allow public update items" on public.items;
drop policy if exists "Allow public delete items" on public.items;

create policy "Allow public read items"
on public.items
for select
to anon, authenticated
using (true);

create policy "Allow public insert items"
on public.items
for insert
to anon, authenticated
with check (true);

create policy "Allow public update items"
on public.items
for update
to anon, authenticated
using (true)
with check (true);

create policy "Allow public delete items"
on public.items
for delete
to anon, authenticated
using (true);

notify pgrst, 'reload schema';
