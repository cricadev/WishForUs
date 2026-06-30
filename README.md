# WishForUS

WishForUS is a cozy Nuxt 3 app for couples to share wishlists, to-do lists, and bucket lists. Two people can create a private shared bucket, join it with an invite code, choose nicknames and avatars, create lists, add items, and see who added or completed each dream.

## Tech Stack

- Nuxt 3
- Vue 3 Composition API
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL
- Supabase Storage later for avatar uploads
- Vercel or Netlify compatible deployment

## MVP Features

- Create a bucket with a readable invite code
- Join a bucket by invite code
- Choose a display name, avatar preset, and optional avatar image URL
- Store the current bucket/member in localStorage
- See all members in a bucket
- Update current member profile from dashboard or settings
- Create, edit, open, and delete lists
- Show who created each list
- Add, edit, complete, uncomplete, and delete items
- Show who added each item
- Show who completed done items
- Clear completion attribution when an item is marked pending
- Copy invite code with a success state
- Bucket and list progress summaries
- Recent items on the bucket dashboard
- Friendly validation, loading, empty, and error states
- Mobile-first UI

## Setup

Install dependencies with pnpm:

```bash
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Fill in:

```env
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in this frontend app.

Run locally:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

## Supabase Setup

For a new Supabase project, run [supabase/schema.sql](./supabase/schema.sql) in the SQL editor.

For a project that already ran the first MVP schema, run [supabase/20260630_collaboration_migration.sql](./supabase/20260630_collaboration_migration.sql).

The SQL includes temporary permissive MVP RLS policies for local testing. They are intentionally open and are not production-grade access control. Before storing sensitive data, replace them with membership-based policies.

## Database Schema

Core tables:

```sql
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
  status text not null default 'pending',
  priority text not null default 'medium',
  due_date date,
  created_by uuid references public.members(id) on delete set null,
  completed_by uuid references public.members(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Temporary MVP RLS policies are included in the SQL files and allow anon/authenticated users to read, insert, update, and delete rows. This keeps the invite-code MVP easy to test while real auth and membership policies are deferred.

## Project Structure

```txt
components/       Reusable UI pieces
composables/      Supabase and local session logic
pages/            Nuxt routes
public/images/    Project image assets
supabase/         Database schema and migrations
types/            Shared TypeScript types
utils/            Small shared helpers
```

## Deployment

Deploy to Vercel or Netlify as a Nuxt app. Add these environment variables in the deployment provider:

```env
NUXT_PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
```

Build command:

```bash
pnpm build
```

## Future Ideas

- Real accounts and magic link login
- Production RLS policies based on bucket membership
- Supabase Storage avatar uploads
- Markdown preview
- Realtime updates
- Comments or reactions on items
- Tags and list templates
- Due date reminders
- Timeline of completed dreams
- PDF export
- Memory gallery
