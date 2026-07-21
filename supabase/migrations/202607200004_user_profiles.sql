create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "users can view their own profile" on public.profiles
for select to authenticated
using (auth.uid() = id);

create policy "users can insert their own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy "users can update their own profile" on public.profiles
for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- No public read access to profiles for now, sender_name will be copied to memories by the server.
