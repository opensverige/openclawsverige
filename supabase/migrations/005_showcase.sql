-- ============================================================
-- OpenSverige Showcase — v1
-- Region: eu-north-1 (Stockholm) — GDPR-compliant för svenska användare
-- ============================================================

create extension if not exists "pgcrypto";

create table builders (
  id               uuid primary key default gen_random_uuid(),
  discord_id       text unique not null,
  discord_username text not null,
  display_name     text,
  avatar_url       text,
  created_at       timestamptz default now()
);

create table projects (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  description        text not null,
  url                text,
  repo_url           text,
  screenshot_url     text,
  builder_id         uuid references builders(id) on delete cascade,
  status             text not null default 'pending'
                       check (status in ('pending','published','archived')),
  discord_message_id text,
  source_channel     text,
  created_at         timestamptz default now(),
  published_at       timestamptz
);

create table tags (
  id       uuid primary key default gen_random_uuid(),
  slug     text unique not null,
  name     text not null,
  category text not null check (category in ('domain','tech','stage'))
);

create table project_tags (
  project_id uuid references projects(id) on delete cascade,
  tag_id     uuid references tags(id) on delete cascade,
  primary key (project_id, tag_id)
);

create index idx_projects_status_published on projects(status, published_at desc);
create index idx_projects_slug             on projects(slug);

-- RLS — service role bypasses automatiskt
alter table projects     enable row level security;
alter table builders     enable row level security;
alter table tags         enable row level security;
alter table project_tags enable row level security;

-- Publik läsning: bara publicerade projekt
create policy "public read published projects" on projects
  for select using (status = 'published');

-- Builder-profiler är publika (Discord-data som användaren själv lämnat)
create policy "public read builders" on builders
  for select using (true);

create policy "public read tags" on tags
  for select using (true);

create policy "public read project_tags" on project_tags
  for select using (true);
