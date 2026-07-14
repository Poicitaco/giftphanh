create extension if not exists pgcrypto;

create table public.jars (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  recipient_name text not null check (char_length(recipient_name) between 1 and 100),
  title text not null check (char_length(title) between 1 and 160),
  intro text not null default '' check (char_length(intro) <= 1000),
  status text not null default 'draft' check (status in ('draft', 'collecting', 'locked', 'opened')),
  recipient_passcode_hash text not null,
  recipient_passcode_hint text not null default '' check (char_length(recipient_passcode_hint) <= 300),
  allow_contributor_gallery boolean not null default true,
  open_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'opened' and opened_at is not null) or status <> 'opened')
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  jar_id uuid not null references public.jars(id) on delete cascade,
  sender_name text check (sender_name is null or char_length(sender_name) between 1 and 100),
  is_anonymous boolean not null default false,
  content text not null check (char_length(content) between 1 and 10000),
  photo_path text,
  visibility text not null default 'private' check (visibility in ('private', 'contributors')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'hidden')),
  edit_token_hash text not null unique,
  edit_passcode_hash text not null,
  color text not null check (color in ('mint', 'lavender', 'sky', 'sage', 'pink', 'peach', 'coral', 'yellow')),
  rotation smallint not null default 0 check (rotation between -8 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_anonymous or sender_name is not null)
);

create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  jar_id uuid not null references public.jars(id) on delete cascade,
  access_token_hash text not null unique,
  created_at timestamptz not null default now()
);

create table public.recipient_sessions (
  id uuid primary key default gen_random_uuid(),
  jar_id uuid not null references public.jars(id) on delete cascade,
  token_hash text not null unique,
  failed_attempts smallint not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.memory_reads (
  recipient_session_id uuid not null references public.recipient_sessions(id) on delete cascade,
  memory_id uuid not null references public.memories(id) on delete cascade,
  opened_at timestamptz not null default now(),
  primary key (recipient_session_id, memory_id)
);

create index jars_owner_id_idx on public.jars(owner_id);
create index memories_jar_id_idx on public.memories(jar_id);
create index memories_jar_status_idx on public.memories(jar_id, moderation_status);
create index contributors_jar_id_idx on public.contributors(jar_id);
create index recipient_sessions_jar_id_idx on public.recipient_sessions(jar_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger jars_set_updated_at before update on public.jars
for each row execute function public.set_updated_at();

create trigger memories_set_updated_at before update on public.memories
for each row execute function public.set_updated_at();

alter table public.jars enable row level security;
alter table public.memories enable row level security;
alter table public.contributors enable row level security;
alter table public.recipient_sessions enable row level security;
alter table public.memory_reads enable row level security;

create policy "owners manage jars" on public.jars
for all to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners manage memories" on public.memories
for all to authenticated
using (exists (
  select 1 from public.jars
  where jars.id = memories.jar_id and jars.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.jars
  where jars.id = memories.jar_id and jars.owner_id = (select auth.uid())
));

create policy "owners manage contributors" on public.contributors
for all to authenticated
using (exists (
  select 1 from public.jars
  where jars.id = contributors.jar_id and jars.owner_id = (select auth.uid())
))
with check (exists (
  select 1 from public.jars
  where jars.id = contributors.jar_id and jars.owner_id = (select auth.uid())
));

create policy "owners inspect recipient sessions" on public.recipient_sessions
for select to authenticated
using (exists (
  select 1 from public.jars
  where jars.id = recipient_sessions.jar_id and jars.owner_id = (select auth.uid())
));

create policy "owners inspect read progress" on public.memory_reads
for select to authenticated
using (exists (
  select 1
  from public.recipient_sessions
  join public.jars on jars.id = recipient_sessions.jar_id
  where recipient_sessions.id = memory_reads.recipient_session_id
    and jars.owner_id = (select auth.uid())
));

revoke all on public.jars, public.memories, public.contributors,
  public.recipient_sessions, public.memory_reads from anon;

grant select, insert, update, delete on public.jars, public.memories,
  public.contributors to authenticated;
grant select on public.recipient_sessions, public.memory_reads to authenticated;
