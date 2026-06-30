alter table public.members
add column if not exists avatar_url text,
add column if not exists avatar_preset text default 'heart',
add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.lists
add column if not exists created_by uuid references public.members(id) on delete set null;

alter table public.items
add column if not exists completed_by uuid references public.members(id) on delete set null,
add column if not exists completed_at timestamptz;

create index if not exists members_auth_user_id_idx on public.members(auth_user_id);
create index if not exists lists_created_by_idx on public.lists(created_by);
create index if not exists items_completed_by_idx on public.items(completed_by);

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
