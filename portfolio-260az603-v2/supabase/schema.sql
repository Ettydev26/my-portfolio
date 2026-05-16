-- Portfolio admin schema
-- Run this once in: Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--
-- Creates only the projects table + an updated_at trigger.
-- Auth, RLS policies, and the storage bucket are set up in the dashboard UI.

create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  description   text not null,
  image_url     text not null,
  image_path    text not null,
  technologies  text[] not null default '{}',
  categories    text[] not null default '{}',
  demo_url      text,
  code_url      text,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.projects (sort_order);

-- Auto-update updated_at on row change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger projects_touch_updated_at
before update on public.projects
for each row execute function public.touch_updated_at();
